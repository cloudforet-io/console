import { CloudServiceFilterMap } from '@/services/asset-inventory/cloud-service/type';

export interface CloudServiceStoreState {
    selectedProvider: string;
    additionalFilters: CloudServiceFilterMap;
}
