import { Ref } from '@vue/composition-api';

export type RefArgs<T> = Ref<T> | Ref<Readonly<T>>
export type cnaRefArgs<T> = T | RefArgs<T>
export type readonlyArgs<T> = T | Readonly<T>
export type readonlyRefArg<T> = readonlyArgs<cnaRefArgs<T>>
export type forceRefArg<T> = readonlyArgs<RefArgs<T>>

export interface ClassTypeOf<T> {
    new(...args: any[]): T
}
