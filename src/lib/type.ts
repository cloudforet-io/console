import { Ref } from '@vue/composition-api';

export type Computed<T> = Readonly<Ref<Readonly<T>>>

export type RefArgs<T> = Ref<T> | Ref<Readonly<T>>
export type cnaRefArgs<T> = T | RefArgs<T>
export type readonlyArgs<T> = T | Readonly<T>
export type readonlyRefArg<T> = readonlyArgs<cnaRefArgs<T>>
export type forceRefArg<T> = readonlyArgs<RefArgs<T>>
export interface ClassTypeOf<T> {
    new(...args: any[]): T;
}
export type JsonSchemaType = 'string'|'number'|'object'|'integer'|'array'|'null';

export interface JsonSchema<T extends JsonSchemaType=JsonSchemaType> {
    type: T;
    title?: string;
    examples?: any[];
    default?: any;
    properties?: {
        [id: string]: JsonSchema;
    };
    enum?: any[];
    items?: JsonSchema;
}
