import {default as chalk} from 'chalk';
import {CatalogApplication} from '../application';
import * as config from "../../config";
import {ElasticsearchDataSource} from '../datasources';
import {Client} from 'loopback-connector-es/node_modules/es7';
import seeders from '../seeders';
import {DefaultCrudRepository} from '@loopback/repository';

export class SeedCommand {
  static signature = 'seed';
  static description = 'Create fake data';

  app: CatalogApplication;

  async run() {
    console.info(chalk.green('Seeding data'));
    await this.up();
    console.info(chalk.green('delete all documents'));
    await this.down();

    for (const seed of seeders) {
      const repository = this.getRepository<DefaultCrudRepository<any, any>>(seed.model);
      console.info(chalk.yellow(`Creating ${seed.model}: ${seed.fields.name}`));
      await repository.create(seed.fields);
      console.info(chalk.yellow(`Created ${seed.model}: ${seed.fields.name}`));
    }

    console.info(chalk.green(`Documents created.`));

  }

  private getRepository<T>(model: string): T {
    return this.app.getSync(`repositories.${model}Repository`);
  }

  private async up() {
    this.app = new CatalogApplication(config);
    await this.app.boot();
  }

  private async down() {
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
}
