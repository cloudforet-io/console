import type { Action } from 'vuex';

import { isEmpty } from 'lodash';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import type { CloudServiceCategory, CloudServiceFilterMap, Period } from '@/services/asset-inventory/cloud-service/type';
import type { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';

export const setSelectedProvider: Action<CloudServiceStoreState, any> = async ({ commit, rootState, dispatch }, provider = 'all') => {
    let providers = rootState.reference.provider.items;
    if (isEmpty(providers)) {
        await dispatch('reference/provider/load', undefined, { root: true });
        providers = rootState.reference.provider.items;
    }

    const providerReference = providers[provider];
    if (!providerReference) {
        commit('setSelectedProvider', 'all');
        return;
    }

    commit('setSelectedProvider', provider);
};

export const setPeriod: Action<CloudServiceStoreState, any> = ({ commit }, period?: Period) => {
    commit('setPeriod', period);
};

export const setAdditionalFilters: Action<CloudServiceStoreState, any> = ({ commit }, additionalFilters: CloudServiceFilterMap = {}) => {
    commit('setAdditionalFilters', additionalFilters);
};

export const setSelectedCategories: Action<CloudServiceStoreState, any> = ({ state, commit }, categories: CloudServiceCategory[] = []) => {
    const additionalFilters = { ...state.additionalFilters };
    additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] = categories;
    commit('setAdditionalFilters', additionalFilters);
};

export const setSelectedRegions: Action<CloudServiceStoreState, any> = ({ state, commit }, regions: string[] = []) => {
    const additionalFilters = { ...state.additionalFilters };
    additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] = regions;
    commit('setAdditionalFilters', additionalFilters);
};

export const setSearchFilters: Action<CloudServiceStoreState, any> = ({ commit }, searchFilters: QueryStoreFilter[] = []) => {
    commit('setSearchFilters', searchFilters);
};
