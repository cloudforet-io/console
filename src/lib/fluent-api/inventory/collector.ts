/* eslint-disable camelcase */
import {
    CreateAction, FluentGetAction,
    GetAction, ListAction,
    Resource,
    ResourceActions, SingleDeleteAction, UpdateAction
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import { CollectorPluginModel } from '@/lib/fluent-api/inventory/collector-plugin';

const idField = 'collector_id';

interface IdParameter {
    [idField]: string;
}

export interface CollectorModel extends IdParameter, Tags{
    name: string;
    state: string;
    plugin_info: CollectorPluginModel;
    priority: number;
    created_at: TimeStamp;
    last_collected_at: TimeStamp | null;
    domain_id: string;
}

export type CollectorListResp = ListType<CollectorModel>

interface CreateParameter extends Tags {
    name: string;
}
interface UpdateParameter extends Tags, IdParameter {
    name: string;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {
    protected idField = idField;
}

class Delete extends SingleDeleteAction<IdParameter, any> {
    protected idField = idField;
}
class Get extends FluentGetAction<IdParameter, CollectorModel> {
    protected idField = idField;
}
class List extends ListAction<any, CollectorListResp> {}
export default class Collector extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'collector';

    create() { return new Create(this.baseUrl); }

    update() { return new Update(this.baseUrl); }

    delete() { return new Delete(this.baseUrl); }

    get() { return new Get(this.baseUrl); }

    list() { return new List(this.baseUrl); }
}
