import {
    CountAction, DiffAction, Resource, ResourceActions,
} from '@/lib/fluent-api/toolset';
import { ListType } from '@/lib/fluent-api/type';
import { ResourceDiffModel } from '@/lib/fluent-api/statistics/type';

export type CloudServiceCountModel = any;
class Diff extends DiffAction<undefined, ListType<ResourceDiffModel>> {}
class Count extends CountAction<undefined, CloudServiceCountModel> {}

export default class CloudService extends Resource implements ResourceActions<'diff' | 'count'> {
    protected name = 'cloud-service'

    diff(): Diff { return new Diff(this.api, this.baseUrl); }

    count(): Count { return new Count(this.api, this.baseUrl); }
}
