import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'elasticsearch',
  connector: 'es',
  index: 'codeflix',
  version: 7,
  defaultSize: '',
  debug: process.env.APP_ENV === 'local',
  ssl: {
    rejectUnauthorized: true
  },
  "configuration": {
    "node": process.env.ELASTIC_SEARCH_HOST,
    "requestTimeout": process.env.ELASTIC_SEARCH_REQUEST_TIMEOUT,
    "pingTimeout": process.env.ELASTIC_SEARCH_PING_TIMEOUT
  },
  "mappingProperties": {
    "docType": {
      "type": "keyword",
    },
    "id": {
      "type": "keyword",
    },
    "name": {
      "type": "text", //analisado
      "fields": {
        "keyword": {
          "type": "keyword",
          "ignore_above": 256
        }
      }
    },
    "description": {
      "type": "text", //analisado
    },
    "type": {
      "type": "byte",
    },
    "is_active": {
      "type": "boolean"
    },
    "created_at": {
      "type": "date"
    },
    "updated_at": {
      "type": "date"
    }
  }
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ElasticsearchDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'elasticsearch';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.elasticsearch', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
