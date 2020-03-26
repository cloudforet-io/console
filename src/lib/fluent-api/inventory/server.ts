/* eslint-disable camelcase */
import {
    GetAction, GetDataAction, ListAction,
    Resource,
    ResourceActions, SubMultiItemAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    CollectionInfo, DataSourceItem, ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'server_id';

interface ServerModel {
    server_id: string;

    tags: any;
    data: any;
    collection_info: CollectionInfo;

    created_at: TimeStamp;
    updated_at: TimeStamp;
}

interface ServerGetParameter {
    server_id: string;
}

class Get extends GetAction<ServerGetParameter, ServerModel> {
    protected idField = idField
}

class Update extends UpdateAction<any, any> {
    protected idField = idField
}


class List extends ListAction<any, ListType<ServerModel>> {}

class GetData extends GetDataAction<any, ListType<any>> {
    protected idField = idField
}

class ChangeProject extends SubMultiItemAction<any,any>{
    path = 'change-project'
    protected idField = 'project_id'

    protected subIdsField = 'servers'

    setReleaseProject(){
        this.apiState.parameter.release_project = true
        return this.clone();
    }

}
export default class Server extends Resource implements ResourceActions<'get'| 'list'|'getData'|'changeProject'|'update'> {
    protected name = 'server';

    get(): Get { return new Get(this.baseUrl); }

    list(): List { return new List(this.baseUrl); }

    getData(): GetData { return new GetData(this.baseUrl); }

    update() { return new Update(this.baseUrl); }

    changeProject(){return new ChangeProject(this.baseUrl);}
}
