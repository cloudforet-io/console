import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    MaintenanceHappening, ProjectDetailState,
} from '@/services/project/project-detail/store/type';

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

export const loadMaintenanceHappenings: Action<ProjectDetailState, any> = async ({ state, commit }): Promise<void> => {
    const queryHelper = new ApiQueryHelper().setFilters([{
        k: 'state', v: 'OPEN', o: '=',
    }]);
    try {
        const { results } = await SpaceConnector.client.monitoring.maintenanceWindow.list({
            project_id: state.projectId,
            query: queryHelper.data,
        });
        const convertedResults: MaintenanceHappening[] = results.map((d) => ({
            title: d.title,
            startTime: d.start_time,
            endTime: d.end_time,
        }));
        commit('setMaintenanceHappenings', convertedResults);
    } catch (e) {
        commit('setMaintenanceHappenings', []);
        console.error(e);
    }
};
