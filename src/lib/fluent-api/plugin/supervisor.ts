/* eslint-disable camelcase */
import {
    GetAction, ListAction,
    Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'supervisor_id';
const idsField = 'supervisors'
interface IdParameter {
    supervisor_id: string;
}

export interface SupervisorModel extends IdParameter, Tags {
    name: string;
    hostname: string;
    state: string;
    is_public: boolean;
    labels?: any;
    domain_id: string;
    created_at: TimeStamp;
    updated_at: TimeStamp;
}

export type SupervisorListResp = ListType<SupervisorModel>

class Get extends GetAction<IdParameter, SupervisorModel> {
    protected idField = idField;
}
class List extends ListAction<any, SupervisorListResp> {}
export default class Supervisor extends Resource implements ResourceActions<'get'|'list'> {
    protected name = 'supervisor';

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }
}
