import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    PublicDashboardInfo,
    UserDashboardInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';


export const useCostExplorerDashboardStore = defineStore('cost-explorer-dashboard', () => {
    const state = reactive({
        loading: true,
        publicDashboardList: [] as PublicDashboardInfo[],
        userDashboardList: [] as UserDashboardInfo[],
    });
    const getters = reactive({
        dashboardList: computed(() => {
            const publicList = state.publicDashboardList.map((d) => ({
                ...d,
                dashboard_id: d.public_dashboard_id,
            }));
            const userList = state.userDashboardList.map((d) => ({
                ...d,
                dashboard_id: d.user_dashboard_id,
            }));
            return [...publicList, ...userList];
        }),
        homeDashboardId: computed(() => store.getters['settings/getItem']('homeDashboard', COST_EXPLORER_ROUTE.DASHBOARD._NAME)),
    });

    /* Actions */
    const setDashboardList = async (): Promise<void> => {
        const userId = store.state.user.userId;
        state.loading = true;
        try {
            const publicDashboardList = await SpaceConnector.client.costAnalysis.publicDashboard.list();
            const userDashboardList = await SpaceConnector.client.costAnalysis.userDashboard.list({
                user_id: userId,
            });
            state.publicDashboardList = publicDashboardList.results;
            state.userDashboardList = userDashboardList.results;
        } catch (e) {
            ErrorHandler.handleError(e);
            state.publicDashboardList = [];
            state.userDashboardList = [];
        } finally {
            state.loading = false;
        }
    };
    const setHomeDashboard = (homeDashboardId: string) => {
        store.dispatch('settings/setItem', {
            key: 'homeDashboard',
            value: homeDashboardId,
            path: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
        });
    };

    return {
        state,
        getters,
        setDashboardList,
        setHomeDashboard,
    };
});
