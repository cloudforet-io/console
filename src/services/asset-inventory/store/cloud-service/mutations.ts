import type { Mutation } from 'vuex';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import type { CloudServiceFilterMap, Period } from '@/services/asset-inventory/cloud-service/type';
import type { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';

export const setSelectedProvider: Mutation<CloudServiceStoreState> = (state, provider: string) => {
    state.selectedProvider = provider;
};

export const setPeriod: Mutation<CloudServiceStoreState> = (state, period?: Period) => {
    state.period = period;
};

export const setAdditionalFilters: Mutation<CloudServiceStoreState> = (state, additionalFilters: CloudServiceFilterMap) => {
    state.additionalFilters = additionalFilters;
};

export const setSearchFilters: Mutation<CloudServiceStoreState> = (state, searchFilters: QueryStoreFilter[]) => {
    state.searchFilters = searchFilters;
};
