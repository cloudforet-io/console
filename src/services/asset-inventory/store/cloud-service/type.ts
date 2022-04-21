import { CloudServiceFilterMap, Period } from '@/services/asset-inventory/cloud-service/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

export interface CloudServiceStoreState {
    selectedProvider: string;
    period?: Period;
    additionalFilters: CloudServiceFilterMap;
    searchFilters: QueryStoreFilter[];
}
