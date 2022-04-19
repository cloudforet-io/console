import { ProjectReferenceState } from '@/store/modules/reference/project/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: ProjectReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
