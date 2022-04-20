import { Action } from 'vuex';
import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';
import { CloudServiceFilterMap } from '@/services/asset-inventory/cloud-service/type';

export const setAdditionalFilters: Action<CloudServiceStoreState, any> = ({ commit }, additionalFilters: CloudServiceFilterMap) => {
    commit('setAdditionalFilters', additionalFilters);
};
