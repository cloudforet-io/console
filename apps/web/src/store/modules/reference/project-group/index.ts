import type { ProjectGroupReferenceState } from '@/store/modules/reference/project-group/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: ProjectGroupReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
