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
    provider: string;
    group: string;
    name: string;

    data_source: DataSourceItem[];
    labels?: string[];
    cloud_service_type_id: string;
    tags: any;

    collection_info: CollectionInfo;
    cloud_service_count?: number;

    created_at: timestamp;
    updated_at: timestamp;
}

interface CstGetParameter {
    cloud_service_type_id: string;
}

class Get extends GetAction<CstGetParameter, CloudServiceTypeModel> {
    protected idField = 'cloud_service_type_id'
}

interface CstListParameter {
    include_cloud_service_count?: boolean;
}

class List extends ListAction<CstListParameter, ListType<CloudServiceTypeModel>> {
    public setCloudServiceCount(isShow = true) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        this.apiState.extraParameter.include_cloud_service_count = isShow;
        return this.clone();
    }
}
export default class CloudServiceType extends Resource implements ResourceActions<'get'| 'list'> {
    protected name = 'cloud-service';

    public get(): Get {
        return new Get(this.baseUrl);
    }

    public list(): List { return new List(this.baseUrl); }
}
