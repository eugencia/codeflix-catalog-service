import {DefaultCrudRepository} from '@loopback/repository';
import {Message} from 'amqplib';
import {pick} from 'lodash';

export interface Options {
  repository: DefaultCrudRepository<any, any>;
  data: any,
  message: Message
}

export abstract class BaseService {
  protected async build({repository, data, message}: Options) {

    const form = this.getForm(data, repository);
    console.log(form);

    switch (this.getAction(message)) {
      case 'created':
        await repository.create(form);
        break;

      case 'updated':
        await repository.updateById(form.id, form);
        break;

      case 'deleted':
        await repository.deleteById(form.id);
        break;
    }
  }

  protected getForm(data: any, repository: DefaultCrudRepository<any, any>) {
    return pick(data, Object.keys(repository.entityClass.definition.properties));
  }

  protected getAction(message: Message): string {
    return message.fields.routingKey.split('.')[1];
  }
}
