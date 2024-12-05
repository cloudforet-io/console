import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';



interface DashboardSettingsStore {
    doNotShowDateRangeWarning?: boolean;
}

export const useDashboardSettingsStore = defineStore('dashboard-settings', () => {
    const state = reactive({
        doNotShowDateRangeWarning: false,
    });
    const getters = reactive({
        getDoNotShowDateRangeWarning: computed<boolean>(() => state.doNotShowDateRangeWarning),
    });

    /* Action */
    const initState = (userId?: string) => {
        const localStorageItem = initServiceSettingsStore<DashboardSettingsStore>('dashboard', userId);
        state.doNotShowDateRangeWarning = localStorageItem?.doNotShowDateRangeWarning ?? false;
    };

    return {
        state,
        getters,
        initState,
    };
});
