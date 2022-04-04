import { ReferenceState } from '@/store/modules/reference/type';
import { ProjectGroupResourceMap } from '@/store/modules/reference/project-group/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: Required<ReferenceState<ProjectGroupResourceMap>> = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
