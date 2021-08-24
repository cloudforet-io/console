import { ServiceState } from '@/store/modules/service/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: ServiceState = {};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
