import type { CloudServiceTypeInfo } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

export interface CloudServiceDetailStoreState {
    provider: string;
    group: string;
    name?: string;
    cloudServiceTypeList: CloudServiceTypeInfo[];
    selectedItem?: CloudServiceTypeInfo;
}
