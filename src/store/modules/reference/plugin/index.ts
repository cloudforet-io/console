import { PluginReferenceState } from '@/store/modules/reference/plugin/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: PluginReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
