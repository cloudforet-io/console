import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';


interface AlertManagerSettingsStore {
    alertLastCheckTime: string;
}


export const useAlertManagerSettingsStore = defineStore('alert-manager-v1-settings', {
    state: (): AlertManagerSettingsStore => ({
        alertLastCheckTime: '',
    }),
    getters: {
        getAlertLastCheckTime: (state): string => state.alertLastCheckTime,
    },
    actions: {
        setAlertLastCheckTime(time: string) {
            this.alertLastCheckTime = time;
        },
        initState(userId?: string) {
            const localStorageItem = initServiceSettingsStore<AlertManagerSettingsStore>('alertManager', userId);
            this.alertLastCheckTime = localStorageItem?.alertLastCheckTime ?? '';
        },
    },
});
