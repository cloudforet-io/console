/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import { CollectorPluginModel } from '@/lib/fluent-api/inventory/collector-plugin';

const idField = 'credential_id';

interface IdParameter {
    [idField]: string;
}


export type SecretListResp = ListType<any>

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
class List extends ListAction<any, ListType<any>> {
    setSecretId(id: string): this{
        this.apiState.extraParameter.credential_id = id;
        delete this.apiState.extraParameter.credential_group_id;
        return this.clone();
    }

    setSecretGroupId(id: string): this{
        this.apiState.extraParameter.credential_group_id = id;
        delete this.apiState.extraParameter.credential_id;
        return this.clone();
    }
}
export default class Secret extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'credential';

    create() { return new Create(this.baseUrl); }

    update() { return new Update(this.baseUrl); }

    delete() { return new Delete(this.baseUrl); }

    get() { return new Get(this.baseUrl); }

    list() { return new List(this.baseUrl); }
}
