import {default as chalk} from 'chalk';
import {CatalogApplication} from '../application';
import * as config from "../../config";
import {ElasticsearchDataSource} from '../datasources';
import {Client} from 'es7';

export class SeedCommand {
  static signature = 'seed';
  static description = 'Create fake data';

  app: CatalogApplication;

  async run() {
    console.info(chalk.green('Seeding data'));
    await this.up();
    console.info(chalk.green('delete all documents'));
    await this.del();
  }

  private async del() {
    const datasource: ElasticsearchDataSource = this.app.getSync<ElasticsearchDataSource>('datasources.elasticsearch');
    // @ts-ignore
    const client: Client = datasource.adapter.db;
    // @ts-ignore
    const index = datasource.adapter.settings.index;

    await client.delete_by_query({
      index,
      body: {
        query: {
          match_all: {}
        }
      }
    });
  }

  private async up() {
    this.app = new CatalogApplication(config);
    await this.app.boot();
  }
}
