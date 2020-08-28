import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {BaseService} from './base.service';
import {CastMemberRepository} from '../repositories';
import {rabbitMQSubscribe} from '../decorators';
import {repository} from '@loopback/repository';
import {Message} from 'amqplib';

@bind({scope: BindingScope.SINGLETON})
export class CastMemberService extends BaseService {
  constructor(
    @repository(CastMemberRepository) private castMemberRepository: CastMemberRepository
  ) {
    super();
  }

  @rabbitMQSubscribe({
    exchange: 'amq.topic',
    queue: 'codeflix-catalog/cast_members',
    routingKey: 'cast_members.*'
  })
  async handler({data, message}: {data: any, message: Message}) {
    await this.build({
      repository: this.castMemberRepository,
      data,
      message
    });
  }
}
