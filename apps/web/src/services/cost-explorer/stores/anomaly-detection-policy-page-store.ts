import { reactive } from 'vue';

import { defineStore } from 'pinia';



export const anomalyDetectionPolicyPageStore = defineStore('anomaly-detection-policy', () => {
    const state = reactive({
    });

    // const getters = reactive({
    //     a: computed<CostQuerySetModel|undefined>(() => {}),
    // });

    /* Mutations */


    /* Actions */


    const mutations = {
    };
    const actions = {
    };
    return {
        state,
        ...mutations,
        ...actions,
    };
});
