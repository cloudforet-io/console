import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const state = reactive({
        // display
        showOverlay: false,
        overlayStep: 1,
    });

    const getters = reactive({});

    /* Mutations */
    const setShowOverlay = (showOverlay: boolean) => {
        state.showOverlay = showOverlay;
    };
    const setOverlayStep = (overlayStep: number) => {
        state.overlayStep = overlayStep;
    };

    const mutations = {
        setShowOverlay,
        setOverlayStep,
    };
    const actions = {};

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
