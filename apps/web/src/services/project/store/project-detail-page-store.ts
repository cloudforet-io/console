
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { defineStore } from 'pinia';

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
interface ProjectDetailPageActions {
    getAlertCounts: () => Promise<void>;
    loadMaintenanceHappenings: () => Promise<void>;
}

export const useProjectDetailPageStore = defineStore<string, ProjectDetailState, any, ProjectDetailPageActions>('project-detail-page', {
    state: () => ({
        projectId: '',
        alertCounts: [],
        maintenanceHappenings: [],
    }),
    actions: {
        async getAlertCounts() {
            try {
                const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
                    project_id: this.projectId,
                });
                this.alertCounts = results;
            } catch (e) {
                this.alertCounts = [];
                console.error(e);
            }
        },
        async loadMaintenanceHappenings() {
            const queryHelper = new ApiQueryHelper().setFilters([{
                k: 'state', v: 'OPEN', o: '=',
            }]);
            try {
                const { results } = await SpaceConnector.client.monitoring.maintenanceWindow.list({
                    project_id: this.projectId,
                    query: queryHelper.data,
                });
                this.maintenanceHappenings = results.map((d) => ({
                    title: d.title,
                    startTime: d.start_time,
                    endTime: d.end_time,
                }));
            } catch (e) {
                this.maintenanceHappenings = [];
                console.error(e);
            }
        },
    },
});
