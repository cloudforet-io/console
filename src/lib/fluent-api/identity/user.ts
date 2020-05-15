/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'user_id';
const idsField = 'users';

interface IdParameter {
    [idField]: string;
}


export type UserListResp = ListType<any>

interface CreateParameter extends Tags {
    name: string;
}
interface UpdateParameter extends Tags, IdParameter {
    password?: string;
    name?: string;
    email?: string;
    mobile?: string;
    group?: string;
    language?: string;
    timezone?: string;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {
    setId(id: string): this {
        const api = this.clone();
        api.apiState.parameter[idField] = id;
        return api;
    }

    setLanguage(lang: string): this {
        const api = this.clone();
        api.apiState.parameter.language = lang;
        return api;
    }
}
class Delete extends SingleDeleteAction<IdParameter, any> {
    idField = idField;
}
class Get extends GetAction<IdParameter, any> {
    idField = idField;
}
class List extends ListAction<any, UserListResp> {}
export default class User extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'user';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }
}
