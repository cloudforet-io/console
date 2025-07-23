import { reactive } from 'vue';

import { defineStore } from 'pinia';


export const useCostReportPageStore = defineStore('page-cost-report', () => {
    const state = reactive({
        selectedCostReportId: undefined as string|undefined,
    });

    /* Mutations */
    const setSelectedCostReportId = (costReportId: string|undefined) => {
        state.selectedCostReportId = costReportId;
    };

    /* Actions */
    const mutations = {
        setSelectedCostReportId,
    };

    return {
        state,
        ...mutations,
    };
});
