/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, TreeAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import project from '@/lib/fluent-api/identity/project';

const idField = 'project_group_id';
const idsField = 'project_groups';

interface IdParameter {
    [idField]: string;
}


export type ProjectGroupListResp = ListType<any>

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
class List extends ListAction<any, ProjectGroupListResp> {}


export default class ProjectGroup extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'project-group';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }
}
