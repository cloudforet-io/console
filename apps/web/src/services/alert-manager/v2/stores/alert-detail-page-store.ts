import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { AlertModel } from '@/api-clients/alert-manager/alert/schema/model';

import { useUserStore } from '@/store/user/user-store';

interface AlertDetailPageStoreState {
    alertInfo: AlertModel;
}
interface AlertDetailPageStoreGetters {
    timezone: ComputedRef<string>;
}

export const useAlertDetailPageStore = defineStore('page-alert-detail', () => {
    const userStore = useUserStore();
    const userState = userStore.state;

    const state = reactive<AlertDetailPageStoreState>({
        alertInfo: {} as AlertModel,
    });

    const getters = reactive<AlertDetailPageStoreGetters>({
        timezone: computed(() => userState.timezone || 'UTC'),
    });

    return {
        state,
        getters,
    };
});
