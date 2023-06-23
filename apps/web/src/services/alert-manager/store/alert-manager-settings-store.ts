import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';


interface AlertManagerSettingsStore {
    alertLastCheckTime: string;
}


export const useAlertManagerSettingsStore = defineStore('alert-manager-settings', {
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
        initState() {
            const localStorageItem = initServiceSettingsStore<AlertManagerSettingsStore>('alertManager');
            this.alertLastCheckTime = localStorageItem?.alertLastCheckTime ?? '';
        },
    },
});
