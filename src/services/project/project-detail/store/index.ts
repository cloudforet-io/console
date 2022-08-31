import * as actions from '@/services/project/project-detail/store/actions';
import * as getters from '@/services/project/project-detail/store/getters';
import * as mutations from '@/services/project/project-detail/store/mutations';
import type { ProjectDetailState } from '@/services/project/project-detail/store/type';

const state: ProjectDetailState = {
    projectId: '',
    alertCounts: [],
    maintenanceHappenings: [],
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
