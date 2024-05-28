import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const state = reactive({
        showOverlay: false,
    });

    const getters = reactive({});

    /* Mutations */
    const setShowOverlay = (showOverlay: boolean) => {
        state.showOverlay = showOverlay;
    };

    const mutations = {
        setShowOverlay,
    };
    const actions = {};

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
