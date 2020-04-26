/* eslint-disable camelcase */
import {
    GetAction, GetDataAction, ListAction, MemberListAction, MultiDeleteAction, MultiItemAction,
    Resource,
    ResourceActions, SubMultiItemAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    CollectionInfo, DataSourceItem, ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'server_id';
const idsField = 'servers';
interface IdParameter {
    [idField]: string;
}
export interface ServerModel extends IdParameter, Tags{
    project_id?: string;
    tags: any;
    data: any;
    collection_info: CollectionInfo;

    created_at: TimeStamp;
    updated_at: TimeStamp;
}

export type ServerListResp = ListType<ServerModel&any>

interface ServerGetParameter {
    server_id: string;
}

class Get extends GetAction<ServerGetParameter, ServerModel> {
    idField = idField
}

class Update extends UpdateAction<any, any> {
    idField = idField
}


class List extends ListAction<any, ServerListResp> {}

class GetData extends GetDataAction<any, ListType<any>> {
    idField = idField
}

class ChangeProject extends SubMultiItemAction<any, any> {
    path = 'change-project'

    idField = 'project_id'

    protected subIdsField = idsField

    setReleaseProject() {
        this.apiState.parameter.release_project = true;
        return this.clone();
    }
}

export type ServerState = 'MAINTENANCE'|'CLOSED'|'INSERVICE'

interface StateParameter {
    state: ServerState;

}

class ChangeState extends MultiItemAction<StateParameter, any> {
    path = 'change-state';

    protected idsField = idsField;

    setMaintenance() {
        this.apiState.parameter.state = 'MAINTENANCE';
        return this.clone();
    }

    setClosed() {
        this.apiState.parameter.state = 'CLOSED';
        return this.clone();
    }

    setInService() {
        this.apiState.parameter.state = 'INSERVICE';
        return this.clone();
    }
}

class Delete extends MultiDeleteAction<any, any> {
    protected idsField = idsField;
}

class MemberList extends MemberListAction<any, any> {
    protected idsField = idsField;
}

export default class Server extends Resource implements ResourceActions<'get'|'list'|'getData'|'changeProject'|'update'|'changeState'|'memberList'> {
    protected name = 'server';

    get(): Get { return new Get(this.api, this.baseUrl); }

    list(): List { return new List(this.api, this.baseUrl); }

    delete(): Delete { return new Delete(this.api, this.baseUrl); }

    getData(): GetData { return new GetData(this.api, this.baseUrl); }

    update(): Update { return new Update(this.api, this.baseUrl); }

    changeProject(): ChangeProject { return new ChangeProject(this.api, this.baseUrl); }

    changeState(): ChangeState { return new ChangeState(this.api, this.baseUrl); }

    memberList(): MemberList { return new MemberList(this.api, this.baseUrl); }
}
