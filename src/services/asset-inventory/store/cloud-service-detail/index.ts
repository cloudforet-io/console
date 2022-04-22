import { CloudServiceDetailStoreState } from '@/services/asset-inventory/store/cloud-service-detail/type';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';


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
