import { AlertCount, ProjectDetailState } from '@/services/project/project-detail/store/type';
import { Mutation } from 'vuex';

export const setProjectId: Mutation<ProjectDetailState> = (state, projectId: string) => {
    state.projectId = projectId;
};

export const setAlertCounts: Mutation<ProjectDetailState> = (state, alertCounts: AlertCount[]) => {
    state.alertCounts = alertCounts;
};
