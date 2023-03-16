import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AlertState } from '@/services/alert-manager/lib/config';

export interface AlertCount {
    state: AlertState;
    total: number;
}

export interface MaintenanceHappening {
    title: string;
    startTime: string;
    endTime: string;
}

export interface ProjectDetailState {
    projectId: string;
    alertCounts: AlertCount[];
    maintenanceHappenings: MaintenanceHappening[];
}

export const useProjectDetailPageStore = defineStore('project-detail-page', () => {
    const state = reactive<ProjectDetailState>({
        projectId: '',
        alertCounts: [],
        maintenanceHappenings: [],
    });

    const getAlertCounts = async (): Promise<void> => {
        try {
            const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
                project_id: state.projectId,
            });
            state.alertCounts = results;
        } catch (e) {
            state.alertCounts = [];
            console.error(e);
        }
    };

    const loadMaintenanceHappenings = async (): Promise<void> => {
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
            state.maintenanceHappenings = convertedResults;
        } catch (e) {
            state.maintenanceHappenings = [];
            console.error(e);
        }
    };

    return {
        state,
        getAlertCounts,
        loadMaintenanceHappenings,
    };
});
