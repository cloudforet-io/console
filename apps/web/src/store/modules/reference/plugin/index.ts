import type { PluginReferenceState } from '@/store/modules/reference/plugin/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: PluginReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
