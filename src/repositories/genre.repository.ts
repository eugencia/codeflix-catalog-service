import {DefaultCrudRepository} from '@loopback/repository';
import {Genre, GenreRelations} from '../models';
import {ElasticsearchDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class GenreRepository extends DefaultCrudRepository<
  Genre,
  typeof Genre.prototype.id,
  GenreRelations
> {
  constructor(
    @inject('datasources.elasticsearch') dataSource: ElasticsearchDataSource,
  ) {
    super(Genre, dataSource);
  }
}
