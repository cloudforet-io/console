import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

export const useDashboardVarsStore = defineStore('dashboard-vars', () => {
    const state = reactive({
        vars: {} as DashboardVars|undefined,
    });

    const setVars = (vars?: DashboardVars) => {
        state.vars = vars;
    };
    const reset = () => {
        setVars();
    };

    const actions = {
        reset,
    };
    const mutations = {
        setVars,
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});

