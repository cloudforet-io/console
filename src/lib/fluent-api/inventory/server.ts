/* eslint-disable camelcase */
import {
    GetAction, GetDataAction, ListAction,
    Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';
import {
    CollectionInfo, DataSourceItem, ListType, timestamp,
} from '@/lib/fluent-api/type';


interface ServerModel {
    server_id:string

    tags:any
    data:any
    collection_info: CollectionInfo

    created_at: timestamp
    updated_at:timestamp
}

interface ServerGetParameter {
    server_id :string
}

class Get extends GetAction<ServerGetParameter, ServerModel> {
    protected idField = 'server_id'
}


class List extends ListAction<any, ListType<ServerModel>> {}

class GetData extends GetDataAction<any, ListType<any>> {
    protected idField = 'server_id'
}
export default class Server extends Resource implements ResourceActions<'get'| 'list'|'getData'> {
    protected name = 'server';

    get(id:string) { return new Get(this.baseUrl, id); }

    list() { return new List(this.baseUrl); }

    getData() { return new GetData(this.baseUrl); }
}
