import {
    CountAction, DiffAction, Resource, ResourceActions,
} from '@/lib/fluent-api/toolset';
import { ListType } from '@/lib/fluent-api/type';
import { ResourceDiffModel } from '@/lib/fluent-api/statistics/type';


export type ServerCountModel = any;
class Diff extends DiffAction<undefined, ListType<ResourceDiffModel>> {}
class Count extends CountAction<undefined, ServerCountModel> {}

export default class Server extends Resource implements ResourceActions<'diff' | 'count'> {
    protected name = 'server'

    diff(): Diff { return new Diff(this.api, this.baseUrl); }

    count(): Count { return new Count(this.api, this.baseUrl); }
}
