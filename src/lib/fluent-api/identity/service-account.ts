/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, MemberListAction, Resource,
    ResourceActions, SingleDeleteAction, SubMultiItemAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

export const idField = 'service_account_id';
export const idsField = 'service_accounts';
interface IdParameter {
    [idField]: string;
}


export type ServiceAccountListResp = ListType<any>

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
class List extends ListAction<any, ServiceAccountListResp> {}


class ChangeProject extends SubMultiItemAction<any, any> {
    path = 'change-project'

    idField = 'project_id'

    protected subIdsField = idsField

    setReleaseProject() {
        this.apiState.parameter.release_project = true;
        return this.clone();
    }
}

class MemberList extends MemberListAction<any, any> {
    protected idsField = idsField;
}

export default class ServiceAccount extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'|'changeProject'> {
    protected name = 'service-account';

    create() { return new Create(this.baseUrl); }

    update() { return new Update(this.baseUrl); }

    delete() { return new Delete(this.baseUrl); }

    get() { return new Get(this.baseUrl); }

    list() { return new List(this.baseUrl); }

    changeProject() { return new ChangeProject(this.baseUrl); }

    memberList(): MemberList { return new MemberList(this.baseUrl); }
}
