/* eslint-disable camelcase */
import {
    GetAction, ListAction,
    Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';
import {
    ListType,  Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'plugin_id';
interface IdParameter {
    plugin_id: string;
}

export interface SupervisorPluginModel extends IdParameter, Tags {
    version: string
    state :string
    endpoint:string
}

export type SupervisorListResp = ListType<SupervisorPluginModel>

class List extends ListAction<any, SupervisorListResp> {}

export default class SupervisorPlugin extends Resource implements ResourceActions<'list'> {
    protected name = 'supervisor/plugin';

    list() { return new List(this.baseUrl); }
}
