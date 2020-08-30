import {bind, BindingScope, inject} from '@loopback/core';
import {getModelSchemaRef, validateRequestBody, RestBindings, AjvFactory} from '@loopback/rest';

interface Options<T> {
  data: object,
  model: Function & {prototype: T};
}

@bind({scope: BindingScope.SINGLETON})
export class ValidatorService {

  cache = new Map();

  constructor(@inject(RestBindings.AJV_FACTORY) private ajvFactory: AjvFactory) {}

  async validate<T extends object>({data, model}: Options<T>) {
    const modelSchema = this.getModelRef(model);
    const schemaRef = {$ref: modelSchema.$ref};
    const schemaName = Object.keys(modelSchema.definitions)[0];

    if (!this.cache.has(schemaName)) {
      this.cache.set(schemaName, modelSchema.definitions[schemaName])
    }

    Array.from(this.cache).reduce<any>(
      (object, [key, value]) => {
        object[key] = value;
        return object
      },
      {}
    );

    await validateRequestBody(
      {value: data, schema: schemaRef},
      {required: true, content: {}},
      modelSchema.definitions, {ajvFactory: this.ajvFactory}
    );
  }

  private getModelRef(model: Function & {}) {
    const modelSchema = getModelSchemaRef(model);
    if (!modelSchema) {
      const error = new Error('The parameter model is not a entity');
      error.name = 'NotModelClass'
      throw error;
    }

    return modelSchema;
  }
}
