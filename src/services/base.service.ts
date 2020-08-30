import {DefaultCrudRepository} from '@loopback/repository';
import {Message} from 'amqplib';
import {pick} from 'lodash';
import {ValidatorService} from './validator.service';

export interface Options {
  repository: DefaultCrudRepository<any, any>;
  data: any,
  message: Message
}

export abstract class BaseService {

  constructor(public validatorService: ValidatorService) {}

  protected async build({repository, data, message}: Options) {

    const {id} = data || {};
    const form = this.getForm(data, repository);

    switch (this.getAction(message)) {
      case 'deleted':
        await repository.deleteById(id);
        break;
      case 'created':
        await this.validatorService.validate({
          data: form,
          model: repository.entityClass
        });
        await repository.create(form)
        break;
      case 'updated':
        const exists = await repository.exists(id);

        await this.validatorService.validate({
          data: form,
          model: repository.entityClass,
          ...(exists && {
            options: {
              partial: true
            }
          })
        });
        return exists
          ? await repository.updateById(id, form)
          : await repository.create(form)
    }
  }

  protected getForm(data: any, repository: DefaultCrudRepository<any, any>) {
    return pick(data, Object.keys(repository.entityClass.definition.properties));
  }

  protected getAction(message: Message): string {
    return message.fields.routingKey.split('.')[1];
  }
}
