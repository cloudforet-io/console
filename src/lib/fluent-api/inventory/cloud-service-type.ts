/* eslint-disable camelcase */
import {
    GetAction,
    Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';
import { CollectionInfo, DataSourceItem, timestamp } from '@/lib/fluent-api/type';


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

class CstGet extends GetAction<CstGetParameter, CloudServiceTypeModel> {
    protected idField = 'cloud_service_type_id'
}

export default class CloudServiceType extends Resource implements ResourceActions<'get'> {
    protected name = 'cloud-service';

    get(id:string) { return new CstGet(this.baseUrl, id); }
}
