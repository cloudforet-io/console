/* eslint-disable camelcase */
import {
    GetAction, ListAction,
    Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';
import {
    CollectionInfo, DataSourceItem, ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'cloud_service_type_id';
const idsField = 'cloud_service_types';
interface IdParameter {
    [idField]: string;
}
export interface CloudServiceTypeModel extends IdParameter, Tags {
    provider: string;
    group: string;
    name: string;

    data_source: DataSourceItem[];
    labels?: string[];

    collection_info: CollectionInfo;
    cloud_service_count?: number;

    created_at: TimeStamp;
    updated_at: TimeStamp;
    deleted_at: TimeStamp;

}
export type CloudServiceTypeListResp = ListType<CloudServiceTypeModel>
interface CstGetParameter {
    cloud_service_type_id: string;
}

class Get extends GetAction<CstGetParameter, CloudServiceTypeModel> {
    protected idField = 'cloud_service_type_id'
}

interface CstListParameter {
    include_cloud_service_count?: boolean;
}

class List extends ListAction<CstListParameter, CloudServiceTypeListResp> {
    setCloudServiceCount(isShow = true): this{
        // eslint-disable-next-line @typescript-eslint/camelcase
        this.apiState.extraParameter.include_cloud_service_count = isShow;
        return this.clone();
    }
}
export default class CloudServiceType extends Resource implements ResourceActions<'get'| 'list'> {
    protected name = 'cloud-service-type';

    get(): Get {
        return new Get(this.api, this.baseUrl);
    }

    list(): List { return new List(this.api, this.baseUrl); }
}
