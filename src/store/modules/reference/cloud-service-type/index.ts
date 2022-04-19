import { CloudServiceTypeReferenceState } from '@/store/modules/reference/cloud-service-type/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: CloudServiceTypeReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
