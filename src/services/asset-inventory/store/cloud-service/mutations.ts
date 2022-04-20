import { Mutation } from 'vuex';
import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';
import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import { CloudServiceFilterMap } from '@/services/asset-inventory/cloud-service/type';


export const setSelectedProvider: Mutation<CloudServiceStoreState> = (state, provider: string) => {
    state.selectedProvider = provider;
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
