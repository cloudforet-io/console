/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'secret_id';

interface IdParameter {
    [idField]: string;
}

export interface SecretModel extends Tags {
    secret_id: string;
    name: string;
    secret_type: 'CREDENTIALS'|'CONFIG'|string;
    'secret_groups': string[];
    'schema': string ;
    'provider': string;
    'service_account_id': string;
    'project_id': string;
    'domain_id': string;
    created_at: TimeStamp;
}

export type SecretListResp = ListType<SecretModel>

interface CreateParameter extends Tags {
    name: string;
    data: any;
    secret_type: string;
    service_account_id?: string;
}
interface UpdateParameter extends Tags, IdParameter {
    name: string;
    data: any;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {}
class Delete extends SingleDeleteAction<IdParameter, any> {
    idField = idField;
}
class Get extends GetAction<IdParameter, any> {
    idField = idField;
}
class List extends ListAction<any, SecretListResp> {
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

    setProvider(provider: string): this {
        this.apiState.extraParameter.provider = provider;
        return this.clone();
    }

    setSchema(schema: string): this {
        this.apiState.extraParameter.schema = schema;
        return this.clone();
    }
}
export default class Secret extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'secret';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }
}
