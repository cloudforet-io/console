import { ServiceAccountReferenceState } from '@/store/modules/reference/service-account/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: ServiceAccountReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
