import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';


export const useCollectorPageStore = defineStore('page-collector', () => {
    const state = reactive({
        selectedProvider: 'all',
        selectedCollectorId: undefined as string|undefined,
        searchFilters: [] as ConsoleFilter[],
        scheduleModalVisible: false,
        scheduleModalMode: 'view',
    });
    const actions = {
        reset() {
            state.selectedProvider = 'all';
            state.selectedCollectorId = undefined;
            state.searchFilters = [];
            state.scheduleModalVisible = false;
            state.scheduleModalMode = 'view';
        },
    };
    return {
        state,
        ...actions,
    };
});
