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
    server_id: string;

    tags: any;
    data: any;
    collection_info: CollectionInfo;

    created_at: timestamp;
    updated_at: timestamp;
}

interface ServerGetParameter {
    server_id: string;
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

    public get(): Get { return new Get(this.baseUrl); }

    public list(): List { return new List(this.baseUrl); }

    public getData(): GetData { return new GetData(this.baseUrl); }
}
