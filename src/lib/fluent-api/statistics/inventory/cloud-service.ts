/* eslint-disable camelcase */
import {
    CountAction, DiffAction, Resource, ResourceActions,
} from '@/lib/fluent-api/toolset';
import { ListType } from '@/lib/fluent-api/type';

export enum CloudServiceUpdateType {
    add = 'ADD',
    delete = 'DELETE',
}
export interface CloudServiceDiffModel {
    provider: string;
    group: string;
    name: string | undefined;
    tags: {
        icon?: string | undefined;
    };
    update_type: CloudServiceUpdateType;
    count: number;
}
class Diff extends DiffAction<undefined, ListType<CloudServiceDiffModel>> {}
class Count extends CountAction<undefined, ListType<CloudServiceDiffModel>> {}

export default class CloudService extends Resource implements ResourceActions<'diff' | 'count'> {
    protected name = 'cloud-service'

    diff(): Diff { return new Diff(this.baseUrl); }

    count(): Count { return new Count(this.baseUrl); }
}
