/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'region_id';

interface IdParameter {
    [idField]: string;
}

export interface RegionModel extends Tags, IdParameter {
    state: string;
    name: string;
    created_at: TimeStamp;
    domain_id: string;
    deleted_at: TimeStamp;
    region_code: string;
    region_type: string;
    collection_info: object;
}

export type RegionListResp = ListType<RegionModel>

interface CreateParameter extends Tags {
    name: string;
}
interface UpdateParameter extends Tags, IdParameter {
    name: string;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {}
class Delete extends SingleDeleteAction<IdParameter, any> {
    idField = idField;
}
class Get extends GetAction<IdParameter, any> {
    idField = idField;
}
class List extends ListAction<any, RegionListResp> {}
export default class Region extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'region';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }
}
