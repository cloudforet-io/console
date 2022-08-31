import type { Mutation } from 'vuex';

import type {
    AlertCount, MaintenanceHappening, ProjectDetailState,
} from '@/services/project/project-detail/store/type';

export const setProjectId: Mutation<ProjectDetailState> = (state, projectId: string) => {
    state.projectId = projectId;
};

export const setAlertCounts: Mutation<ProjectDetailState> = (state, alertCounts: AlertCount[]) => {
    state.alertCounts = alertCounts;
};

export const setMaintenanceHappenings: Mutation<ProjectDetailState> = (state, maintenanceHappenings: MaintenanceHappening[]) => {
    state.maintenanceHappenings = maintenanceHappenings;
};
