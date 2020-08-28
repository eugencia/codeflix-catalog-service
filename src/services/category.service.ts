import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {rabbitMQSubscribe} from '../decorators';
import {CategoryRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {Message} from 'amqplib';
import {BaseService} from './base.service';

@bind({scope: BindingScope.SINGLETON})
export class CategoryService extends BaseService {
  constructor(
    @repository(CategoryRepository) private categoryRepository: CategoryRepository
  ) {
    super();
  }

  @rabbitMQSubscribe({
    exchange: 'amq.topic',
    queue: 'codeflix-catalog/categories',
    routingKey: 'categories.*'
  })
  async handler({data, message}: {data: any, message: Message}) {
    await this.build({
      repository: this.categoryRepository,
      data,
      message
    });
  }
}
