import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

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
    const updateDoNotShowDateRangeWarning = (value: boolean) => {
        const userId = store.state.user.userId;
        const settings = LocalStorageAccessor.getItem(userId) ?? {};
        settings.dashboard = {
            doNotShowDateRangeWarning: value,
        };
        LocalStorageAccessor.setItem(userId, settings);
        state.doNotShowDateRangeWarning = value;
    };
    const initState = () => {
        const localStorageItem = initServiceSettingsStore<DashboardSettingsStore>('dashboard');
        state.doNotShowDateRangeWarning = localStorageItem?.doNotShowDateRangeWarning ?? false;
    };

    return {
        state,
        getters,
        updateDoNotShowDateRangeWarning,
        initState,
    };
});
