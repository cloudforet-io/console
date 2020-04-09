/* eslint-disable camelcase */
// eslint-disable-next-line import/no-cycle
import {
    GetAction, ListAction,
    Resource,
    ResourceActions, SubMultiItemAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'plugin_id';
interface IdParameter {
    plugin_id: string;
}

export interface SupervisorPluginModel extends IdParameter, Tags {
    version: string;
    state: string;
    endpoint: string;
    managed: boolean;
    supervisor_id: string;
    supervisor_name: string;
}

export type SupervisorListResp = ListType<SupervisorPluginModel>

class List extends ListAction<any, SupervisorListResp> {}

class Recovery extends SubMultiItemAction<any, any> {
    path='recover'

    idField = 'supervisor_id'

    subIdsField = 'plugins'
}
export default class SupervisorPlugin extends Resource implements ResourceActions<'list'> {
    protected name = 'supervisor/plugin';

    list() { return new List(this.baseUrl); }

    recovery() { return new Recovery(this.baseUrl); }
}
