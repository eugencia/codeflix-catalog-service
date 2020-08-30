import {Component, Binding, CoreBindings, inject} from '@loopback/core';
import {RestTags} from '@loopback/rest';
import {ApplicationWithServices} from '@loopback/service-proxy';
import {DefaultCrudRepository} from '@loopback/repository';
import {difference} from 'lodash';
import {ValidationError} from 'ajv';

export class ValidatorComponent implements Component {
  bindings: Array<Binding> = [];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: ApplicationWithServices
  ) {
    this.bindings = this.validators();
  }

  validators() {
    return [
      Binding.bind('ajv.keywords.exists').to({
        name: 'exists',
        validate: async ([model, field]: Array<any>, value: any) => {
          const values = Array.isArray(value) ? value : [value];
          const repository = this.app.getSync<DefaultCrudRepository<any, any>>(`repositories.${model}Repository`)
          const documents = await repository.find({
            where: {
              or: values.map(v => ({[field]: v}))
            }
          })

          if (documents.length !== values.length) {
            console.log('dentro do if');
            const valuesNotExists = difference(values, documents.map(document => document[field]));
            const errors = valuesNotExists.map(valueNotExist => ({message: `The value ${valueNotExist} for ${model} not exists.`}))
            throw new ValidationError(errors as any);
          }

          return true;
        },
        async: true
      }).tag(RestTags.AJV_KEYWORD)
    ];
  }
}
