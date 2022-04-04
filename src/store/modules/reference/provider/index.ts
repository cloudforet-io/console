import { ResourceState } from '@/store/modules/reference/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: Required<ResourceState> = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
