import type { ProjectReferenceState } from '@/store/modules/reference/project/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: ProjectReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
