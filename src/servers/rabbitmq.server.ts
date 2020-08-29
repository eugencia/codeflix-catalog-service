import {Server, Context, inject, CoreBindings, Application, MetadataInspector, Binding} from '@loopback/core';
import {Channel, Options, ConfirmChannel, Message} from 'amqplib';
import {CategoryRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {RabbitMQBindings} from '../keys';
import {RabbitMQSubscribeMetadata, RABBITMQ_SUBSCRIBE_DECORATOR} from '../decorators/rabbitMQSubscribe.decorator';
import {AmqpConnectionManagerOptions, connect, AmqpConnectionManager, ChannelWrapper} from 'amqp-connection-manager';

export enum Acknowledgement {
  ACK = 0,
  NACK = 1,
  REQUEUE = 2
}

export interface RabbitMQConfig {
  hosts: string[],
  options?: AmqpConnectionManagerOptions
  exchanges?: {name: string, type: string, options?: Options.AssertExchange}[],
  acknowledgement?: Acknowledgement
}

export class RabbitMQServer extends Context implements Server {
  private _listening: boolean;
  private _connectionManager: AmqpConnectionManager;
  private _channelManager: ChannelWrapper;
  channel: Channel;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(RabbitMQBindings.CONFIG) private config: RabbitMQConfig,
    @repository(CategoryRepository) private categoryRepository: CategoryRepository
  ) {
    super(app);
  }

  async start(): Promise<void> {
    this._connectionManager = connect(this.config.hosts, this.config.options);
    this._channelManager = this._connectionManager.createChannel();

    this._channelManager.on('connect', () => {
      this._listening = true;
    });

    this._channelManager.on('error', (error, {name}) => {
      console.error(`Erro ao Conecatar no channel ${name}. ${error.message}`);
      this._listening = false;
    });

    await this.setUpExchanges();
    await this.bindSubscribers();
  };

  async stop(): Promise<void> {
    await this._connectionManager.close();
    this._listening = false;
  };

  private async consume({channel, queue, method}: {channel: ConfirmChannel, queue: string, method: Function}) {
    await channel.consume(queue, async message => {
      try {
        if (!message) throw new Error("Recebendo message nula");

        const content = message.content;

        if (content) {
          let data;
          try {
            data = JSON.parse(content.toString());
          } catch (error) {
            data = null;
          }

          const acknowledgement = await method({data, message, channel});
          this.dispacthAcknowledgement(channel, message, acknowledgement);
        }
      } catch (error) {
        console.error(error)
        if (!message) return;

        this.dispacthAcknowledgement(channel, message, this.config?.acknowledgement);
      }
    });
  }

  private bindSubscribers() {
    this.getSubscribers()
      .map(async (subscribe) => {
        await this.channelManager.addSetup(async (channel: ConfirmChannel) => {
          const {exchange, queue, routingKey, queueOptions} = subscribe.metadata;
          const assertQueue = await channel.assertQueue(
            queue ?? '',
            queueOptions ?? undefined
          );
          const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

          await Promise.all(
            routingKeys.map((routingKey) => channel.bindQueue(assertQueue.queue, exchange, routingKey))
          )
          await this.consume({
            channel,
            queue: assertQueue.queue,
            method: subscribe.method
          });
        });
      });
  }

  private getSubscribers(): {method: Function, metadata: RabbitMQSubscribeMetadata}[] {
    const bindings: Array<Readonly<Binding>> = this.find('services.*');

    return bindings.map(binding => {
      const metadata = MetadataInspector.getAllMethodMetadata<RabbitMQSubscribeMetadata>(
        RABBITMQ_SUBSCRIBE_DECORATOR, binding.valueConstructor?.prototype
      );

      if (!metadata) return [];

      const methods = [];

      for (const methodName in metadata) {
        if (!Object.prototype.hasOwnProperty.call(metadata, methodName)) return;

        const service = this.getSync(binding.key) as any;

        methods.push({
          method: service[methodName].bind(service),
          metadata: metadata[methodName]
        });
      }

      return methods;
    }).reduce((collection: any, item: any) => {
      collection.push(...item);
      return collection;
    }, []);
  }

  private async setUpExchanges() {
    return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
      if (!this.config.exchanges) return;

      await Promise.all(this.config.exchanges.map((exchange) => {
        channel.assertExchange(exchange.name, exchange.type, exchange.options);
      }));
    });
  }

  private dispacthAcknowledgement(channel: Channel, message: Message, acknowledgement?: Acknowledgement) {

    switch (acknowledgement) {
      case Acknowledgement.NACK:
        channel.nack(message, false, false);
        break;

      case Acknowledgement.REQUEUE:
        channel.nack(message, false, true);
        break;

      case Acknowledgement.REQUEUE:
      default:
        channel.ack(message);
        break;
    }

  }

  get listening(): boolean {
    return this._listening;
  }

  get connectionManager(): AmqpConnectionManager {
    return this._connectionManager;
  }

  get channelManager(): ChannelWrapper {
    return this._channelManager;
  }
}
