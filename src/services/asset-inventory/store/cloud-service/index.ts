import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';
import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';


const state: CloudServiceStoreState = {
    selectedProvider: 'all',
    additionalFilters: {
        [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: [],
        [CLOUD_SERVICE_FILTER_KEY.REGION]: [],
    },
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
