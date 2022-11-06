import type { CloudServiceDetailStoreState } from '@/services/asset-inventory/store/cloud-service-detail/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: CloudServiceDetailStoreState = {
    provider: '',
    group: '',
    name: undefined,
    cloudServiceTypeList: [],
    selectedItem: undefined,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
