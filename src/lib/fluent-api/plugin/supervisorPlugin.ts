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
const idFields = 'plugins';
interface IdParameter {
    plugin_id: string;
}

export interface SupervisorPluginModel extends IdParameter, Tags {
    // version: string;
    // state: string;
    // endpoint: string;
    // managed: boolean;
    // supervisor_id: string;
    // supervisor_name: string;
    endpoint: string;
    endpoints: Array<string | undefined>;
    managed: boolean;
    // eslint-disable-next-line camelcase
    plugin_id: string;
    state: string;
    // eslint-disable-next-line camelcase
    supervisor_id: string;
    // eslint-disable-next-line camelcase
    supervisor_name: string;
    version: string;
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

    list() { return new List(this.api, this.baseUrl); }

    recovery() { return new Recovery(this.api, this.baseUrl); }
}
