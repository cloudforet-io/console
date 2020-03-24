/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import { CollectorPluginModel } from '@/lib/fluent-api/inventory/collector-plugin';

const idField = 'credential_group_id';

interface IdParameter {
    [idField]: string;
}


export type SecretGroupListResp = ListType<any>

interface CreateParameter extends Tags {
    name: string;
}
interface UpdateParameter extends Tags, IdParameter {
    name: string;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {}
class Delete extends SingleDeleteAction<IdParameter, any> {
    protected idField = idField;
}
class Get extends GetAction<IdParameter, any> {
    protected idField = idField;
}
class List extends ListAction<any, SecretGroupListResp> {}
export default class SecretGroup extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'credential-group';

    create() { return new Create(this.baseUrl); }

    update() { return new Update(this.baseUrl); }

    delete() { return new Delete(this.baseUrl); }

    get() { return new Get(this.baseUrl); }

    list() { return new List(this.baseUrl); }
}
