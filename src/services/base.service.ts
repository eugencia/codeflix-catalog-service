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

    const {id} = data || {};
    const form = this.getForm(data, repository);
    console.log(form);

    switch (this.getAction(message)) {
      case 'deleted':
        await repository.deleteById(id);
        break;
      case 'created':
      case 'updated':
        repository.exists(id)
          ? await repository.updateById(id, form)
          : await repository.create(form)
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
