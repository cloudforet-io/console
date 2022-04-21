import { Action } from 'vuex';
import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';
import { CloudServiceFilterMap, Period } from '@/services/asset-inventory/cloud-service/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

export const setPeriod: Action<CloudServiceStoreState, any> = ({ commit }, period?: Period) => {
    commit('setPeriod', period);
};

export const setAdditionalFilters: Action<CloudServiceStoreState, any> = ({ commit }, additionalFilters: CloudServiceFilterMap) => {
    commit('setAdditionalFilters', additionalFilters);
};

export const setSearchFilters: Action<CloudServiceStoreState, any> = ({ commit }, searchFilters: QueryStoreFilter[]) => {
    commit('setSearchFilters', searchFilters);
};
