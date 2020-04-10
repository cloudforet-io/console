/* eslint-disable camelcase */
import {
    CountAction, DiffAction, Resource, ResourceActions,
} from '@/lib/fluent-api/toolset';
import { ListType } from '@/lib/fluent-api/type';

export enum ServerUpdateType {
    add = 'ADD',
    delete = 'DELETE',
}
export interface ServerDiffModel {
    provider: string;
    group: string;
    name: string | undefined;
    tags: {
        icon?: string | undefined;
    };
    update_type: ServerUpdateType;
    count: number;
}
class Diff extends DiffAction<undefined, ListType<ServerDiffModel>> {}
class Count extends CountAction<undefined, ListType<ServerDiffModel>> {}

export default class Server extends Resource implements ResourceActions<'diff' | 'count'> {
    protected name = 'server'

    diff(): Diff { return new Diff(this.baseUrl); }

    count(): Count { return new Count(this.baseUrl); }
}
