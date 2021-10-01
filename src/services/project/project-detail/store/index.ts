import { ProjectDetailState } from '@/services/project/project-detail/store/type';
import * as getters from '@/services/project/project-detail/store/getters';
import * as actions from '@/services/project/project-detail/store/actions';
import * as mutations from '@/services/project/project-detail/store/mutations';

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
