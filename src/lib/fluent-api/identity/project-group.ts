/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, SingleItemQueryAction, SubMultiItemAction, TreeAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, ProjectGroupInfo, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'project_group_id';

interface IdParameter {
    [idField]: string;
}


interface CreateParameter extends Tags {
    name: string;
}
interface UpdateParameter extends Tags, IdParameter {
    name: string;
}

interface ExtraParameter {
    include_provider: boolean;
    recursive: boolean;
    project_group_id: string;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {}
class Delete extends SingleDeleteAction<IdParameter, any> {
    idField = idField;
}
class Get extends GetAction<IdParameter, ProjectGroupInfo> {
    idField = idField;
}
class List extends ListAction<any, ListType<ProjectGroupInfo>> {}

class ListProjects extends SingleItemQueryAction<ExtraParameter, any> {
    path = 'list-projects'

    idField = 'project_group_id';

    setIncludeProvider(val = true) {
        const api = this.clone();
        api.apiState.extraParameter.include_provider = val;
        return api;
    }

    setRecursive(val) {
        const api = this.clone();
        api.apiState.extraParameter.recursive = val;
        return api;
    }

    setProjectGroupId(val) {
        const api = this.clone();
        api.apiState.extraParameter.project_group_id = val;
        return api;
    }
}


export default class ProjectGroup extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'|'listProjects'> {
    protected name = 'project-group';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }

    listProjects() { return new ListProjects(this.api, this.baseUrl); }
}
