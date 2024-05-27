import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const state = reactive({});

    const getters = reactive({});

    const mutations = {};
    const actions = {};

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
