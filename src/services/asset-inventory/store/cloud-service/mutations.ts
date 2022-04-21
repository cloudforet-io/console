import { Mutation } from 'vuex';
import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';
import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import { CloudServiceFilterMap, Period } from '@/services/asset-inventory/cloud-service/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';


export const setSelectedProvider: Mutation<CloudServiceStoreState> = (state, provider: string) => {
    state.selectedProvider = provider;
};

export const setPeriod: Mutation<CloudServiceStoreState> = (state, period?: Period) => {
    state.period = period;
};

export const setSelectedCategories: Mutation<CloudServiceStoreState> = (state, categories: string[]) => {
    state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] = categories;
    state.additionalFilters = { ...state.additionalFilters };
};

export const setSelectedRegions: Mutation<CloudServiceStoreState> = (state, regions: string[]) => {
    state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] = regions;
    state.additionalFilters = { ...state.additionalFilters };
};

export const setAdditionalFilters: Mutation<CloudServiceStoreState> = (state, additionalFilters: CloudServiceFilterMap) => {
    state.additionalFilters = additionalFilters;
};

export const setSearchFilters: Mutation<CloudServiceStoreState> = (state, searchFilters: QueryStoreFilter[]) => {
    state.searchFilters = searchFilters;
};
