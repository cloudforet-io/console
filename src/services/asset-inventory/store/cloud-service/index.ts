import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import type { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: CloudServiceStoreState = {
    selectedProvider: 'all',
    period: undefined,
    additionalFilters: {
        [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: [],
        [CLOUD_SERVICE_FILTER_KEY.REGION]: [],
    },
    searchFilters: [],
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
