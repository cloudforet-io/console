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
export interface ServerModel {
    server_id: string;
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
    protected idField = idField
}

class Update extends UpdateAction<any, any> {
    protected idField = idField
}


class List extends ListAction<any, ServerListResp> {}

class GetData extends GetDataAction<any, ListType<any>> {
    protected idField = idField
}

class ChangeProject extends SubMultiItemAction<any, any> {
    path = 'change-project'

    protected idField = 'project_id'

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

    get(): Get { return new Get(this.baseUrl); }

    list(): List { return new List(this.baseUrl); }

    delete(): Delete { return new Delete(this.baseUrl); }

    getData(): GetData { return new GetData(this.baseUrl); }

    update(): Update { return new Update(this.baseUrl); }

    changeProject(): ChangeProject { return new ChangeProject(this.baseUrl); }

    changeState(): ChangeState { return new ChangeState(this.baseUrl); }

    memberList(): MemberList { return new MemberList(this.baseUrl); }
}
