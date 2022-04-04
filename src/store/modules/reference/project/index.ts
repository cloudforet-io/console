import { ReferenceState } from '@/store/modules/reference/type';
import { ProjectResourceMap } from '@/store/modules/reference/project/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: Required<ReferenceState<ProjectResourceMap>> = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
