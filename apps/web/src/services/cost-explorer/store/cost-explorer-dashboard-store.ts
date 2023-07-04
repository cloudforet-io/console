import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    PublicDashboardInfo,
    UserDashboardInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/store/cost-explorer-settings-store';

const costExplorerSettingsStore = useCostExplorerSettingsStore();
costExplorerSettingsStore.initState();

export const useCostExplorerDashboardStore = defineStore('cost-explorer-dashboard', {
    state: () => ({
        loading: true,
        publicDashboardList: [] as PublicDashboardInfo[],
        userDashboardList: [] as UserDashboardInfo[],
    }),
    getters: {
        dashboardList: (state) => {
            const publicList = state.publicDashboardList.map((d) => ({
                ...d,
                dashboard_id: d.public_dashboard_id,
            }));
            const userList = state.userDashboardList.map((d) => ({
                ...d,
                dashboard_id: d.user_dashboard_id,
            }));
            return [...publicList, ...userList];
        },
        homeDashboardId: () => costExplorerSettingsStore.homeDashboardId,
    },
    actions: {
        async setDashboardList(): Promise<void> {
            const userId = store.state.user.userId;
            this.loading = true;
            try {
                const publicDashboardList = await SpaceConnector.client.costAnalysis.publicDashboard.list();
                const userDashboardList = await SpaceConnector.client.costAnalysis.userDashboard.list({
                    user_id: userId,
                });
                this.publicDashboardList = publicDashboardList.results;
                this.userDashboardList = userDashboardList.results;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.publicDashboardList = [];
                this.userDashboardList = [];
            } finally {
                this.loading = false;
            }
        },
        setHomeDashboard(homeDashboardId: string) {
            costExplorerSettingsStore.setHomeDashboardId(homeDashboardId);
        },
    },
});
