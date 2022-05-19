import * as actions from '@/services/project/project-detail/store/actions';
import * as getters from '@/services/project/project-detail/store/getters';
import * as mutations from '@/services/project/project-detail/store/mutations';
import { ProjectDetailState } from '@/services/project/project-detail/store/type';

const state: ProjectDetailState = {
    projectId: '',
    alertCounts: [],
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
