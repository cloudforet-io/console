/* eslint-disable camelcase */
import {
    GetAction, ListAction,
    Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';
import {
    CollectionInfo, DataSourceItem, ListType, timestamp,
} from '@/lib/fluent-api/type';


interface CloudServiceTypeModel {
    provider:string
    group:string
    name: string

    data_source:DataSourceItem[];
    labels?: string[];
    cloud_service_type_id:string;
    tags:any

    collection_info: CollectionInfo
    cloud_service_count?:number

    created_at: timestamp
    updated_at:timestamp
}

interface CstGetParameter {
    cloud_service_type_id :string
}

class Get extends GetAction<CstGetParameter, CloudServiceTypeModel> {
    protected idField = 'cloud_service_type_id'
}

interface CstListParameter {
    include_cloud_service_count?:boolean
}

class List extends ListAction<CstListParameter, ListType<CloudServiceTypeModel>> {
    public setCloudServiceCount(isShow:boolean = true) {
        this.apiState.extraParameter.include_cloud_service_count = isShow;
        return this.clone();
    }
}
export default class CloudServiceType extends Resource implements ResourceActions<'get'| 'list'> {
    protected name = 'cloud-service';

    get(id:string) { return new Get(this.baseUrl, id); }

    list() { return new List(this.baseUrl); }
}
