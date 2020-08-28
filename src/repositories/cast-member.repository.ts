import {DefaultCrudRepository} from '@loopback/repository';
import {CastMember, CastMemberRelations} from '../models';
import {ElasticsearchDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CastMemberRepository extends DefaultCrudRepository<
  CastMember,
  typeof CastMember.prototype.id,
  CastMemberRelations
> {
  constructor(
    @inject('datasources.elasticsearch') dataSource: ElasticsearchDataSource,
  ) {
    super(CastMember, dataSource);
  }
}
