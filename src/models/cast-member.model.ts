import {Entity, model, property} from '@loopback/repository';

export enum Role {
  DIRECTOR = 1,
  ACTOR = 2
}

@model({settings: {strict: false}})
export class CastMember extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 1,
      maxLength: 255
    }
  })
  name: string;

  @property({
    type: 'number',
    required: true,
    enum: [Role.ACTOR, Role.DIRECTOR]
  })
  role: number;

  @property({
    type: 'date',
    required: true,
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
  })
  updated_at: string;

  constructor(data?: Partial<CastMember>) {
    super(data);
  }
}

export interface CastMemberRelations {
  // describe navigational properties here
}

export type CastMemberWithRelations = CastMember & CastMemberRelations;
