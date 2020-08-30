import {bind, BindingScope, service} from '@loopback/core';
import {BaseService} from './base.service';
import {GenreRepository} from '../repositories';
import {rabbitMQSubscribe} from '../decorators';
import {repository} from '@loopback/repository';
import {Message} from 'amqplib';
import {ValidatorService} from './validator.service';

@bind({scope: BindingScope.SINGLETON})
export class GenreService extends BaseService {
  constructor(
    @repository(GenreRepository) private genreRepository: GenreRepository,
    @service(ValidatorService) public validatorService: ValidatorService
  ) {
    super(validatorService);
  }

  @rabbitMQSubscribe({
    exchange: 'amq.topic',
    queue: 'codeflix-catalog/genres',
    routingKey: 'genres.*'
  })
  async handler({data, message}: {data: any, message: Message}) {
    await this.build({
      repository: this.genreRepository,
      data,
      message
    });
  }
}
