/* eslint-disable camelcase */
import {
    BaseConfigActionAPI,
    CreateAction,
    GetAction,
    ListAction,
    MemberListAction,
    Resource,
    ResourceActions, ServiceResources,
    SingleDeleteAction,
    SingleItemMemberListAction,
    SubMultiItemAction,
    SubMultiItemAddAction,
    TreeAction, TreeSearchAction,
    UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, ProjectGroupInfo, Tags, TimeStamp, TreeResp,
} from '@/lib/fluent-api/type';
import Config from '@/lib/fluent-api/config';

const idField = 'project_id';

interface IdParameter {
    [idField]: string;
}

export interface ProjectModel {
    project_id: string;
    name: string;
    state: string;
    project_group_info: ProjectGroupInfo;
    providers?: string[];
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
    tags: object;
}

export type ProjectListResp = ListType<ProjectModel>

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
class Get extends GetAction<IdParameter, ProjectModel> {
    idField = idField;
}

interface ProjectListParameter {
    include_provider: boolean;
}
class List extends ListAction<ProjectListParameter, ProjectListResp> {
    setIncludeProvider(val = true) {
        this.apiState.extraParameter.include_provider = val;
        return this.clone();
    }
}

class MemberList extends SingleItemMemberListAction<any, any> {
    idField = idField;
}

export interface ProjectTreeParameter {
    include_project: boolean;
}

export interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

export class ProjectTree extends TreeAction<ProjectTreeParameter, TreeResp<ProjectItemResp>> {
    setExcludeProject(val = true) {
        return val ? this.setExcludeType('PROJECT') : this.setExcludeType('');
    }
}

export interface TreeSearchResp {
    open_path: string[];
}

class TreeSearch extends TreeSearchAction<ProjectTreeParameter, TreeSearchResp> {
}

abstract class MemberAction extends SubMultiItemAction<any, any> {
    idField = idField;

    protected subIdsField = 'users';
}

class AddMember extends MemberAction {
    path = 'member/add'
}

class RemoveMember extends MemberAction {
    path = 'member/remove'
}

export interface ProjectFavoriteParameter {
    projectId?: string[];
    projectGroupId?: string[];
}

class Favorite extends Config<ProjectFavoriteParameter, ProjectFavoriteParameter> {
    name = 'favorite'
}

export default class Project extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'|'tree'|'treeSearch'|'memberList'|'addMember'|'removeMember'>,
    ServiceResources<'favorite'> {
    protected name = 'project';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }

    memberList() { return new MemberList(this.api, this.baseUrl); }

    tree() { return new ProjectTree(this.api, this.baseUrl); }

    treeSearch() { return new TreeSearch(this.api, this.baseUrl); }

    addMember() { return new AddMember(this.api, this.baseUrl); }

    removeMember() { return new RemoveMember(this.api, this.baseUrl); }

    favorite() { return new Favorite(this.api, this.baseUrl.substring(0, this.baseUrl.length - 1)); }
}
