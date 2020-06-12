/* eslint-disable camelcase */
import {
    CreateAction,
    GetAction,
    ListAction,
    MemberListAction,
    Resource,
    ResourceActions,
    SingleDeleteAction,
    SingleItemMemberListAction,
    SubMultiItemAction,
    SubMultiItemAddAction,
    TreeAction, TreeSearchAction,
    UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, ProjectGroupInfo, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'project_id';

interface IdParameter {
    [idField]: string;
}

export interface ProjectModel extends IdParameter, Tags{
    name: string;
    state: string;
    project_group_info: ProjectGroupInfo;
    providers?: string[];
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
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

interface ProjectTreeParameter {
    include_project: boolean;
}

class Tree extends TreeAction<ProjectTreeParameter, any> {
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

export default class Project extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'|'tree'|'treeSearch'|'memberList'|'addMember'|'removeMember'> {
    protected name = 'project';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }

    memberList() { return new MemberList(this.api, this.baseUrl); }

    tree() { return new Tree(this.api, this.baseUrl); }

    treeSearch() { return new TreeSearch(this.api, this.baseUrl); }

    addMember() { return new AddMember(this.api, this.baseUrl); }

    removeMember() { return new RemoveMember(this.api, this.baseUrl); }
}
