import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { DashboardModel, DashboardOptions } from '@/api-clients/dashboard/_types/dashboard-type';

export const useWidgetContextStore = defineStore('widget-context', () => {
    const state = reactive({
        dashboard: undefined as DashboardModel | undefined,
    });


    const getters = {
        dashboardId: computed<string | undefined>(() => state.dashboard?.dashboard_id),
        options: computed<DashboardOptions>(() => state.dashboard?.options || {}),
    };

    const setDashboard = (dashboard?: DashboardModel) => {
        state.dashboard = dashboard;
    };


    const mutations = {
        setDashboard,
    };

    return {
        state,
        getters,
        ...mutations,
    };
});
