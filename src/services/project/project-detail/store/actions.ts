import { ProjectDetailState } from '@/services/project/project-detail/store/type';
import { Action } from 'vuex';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

export const getAlertCounts: Action<ProjectDetailState, any> = async ({ state, commit }): Promise<void> => {
    try {
        const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
            project_id: state.projectId,
        });
        commit('setAlertCounts', results);
    } catch (e) {
        commit('setAlertCounts', []);
        console.error(e);
    }
};
