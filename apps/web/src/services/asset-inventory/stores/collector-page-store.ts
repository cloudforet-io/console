import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { Schedule } from '@/api-clients/inventory/collector/schema/type';


export const useCollectorPageStore = defineStore('page-collector', () => {
    const state = reactive({
        selectedProvider: 'all',
        selectedCollectorId: undefined as string|undefined,

        schedules: [] as Schedule[],

        thisPage: 1,
        pageSize: 24,
        sortBy: 'name',
        searchFilters: [] as ConsoleFilter[],

        visible: {
            scheduleModal: false,
        },
        scheduleModalMode: 'view',
    });
    const actions = {
        setSelectedCollectorId(id?: string) {
            state.selectedCollectorId = id;
        },
        reset() {
            state.selectedProvider = 'all';
            state.selectedCollectorId = undefined;
            state.schedules = [];
            state.thisPage = 1;
            state.pageSize = 24;
            state.sortBy = 'name';
            state.searchFilters = [];
            state.visible.scheduleModal = false;
            state.scheduleModalMode = 'view';
        },
    };
    return {
        state,
        ...actions,
    };
});
