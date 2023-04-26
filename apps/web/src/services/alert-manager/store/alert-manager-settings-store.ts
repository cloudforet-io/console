import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';


interface AlertManagerSettingsStore {
    alertLastCheckTime: string;
}


export const useAlertManagerSettingsStore = defineStore('alert-manager-settings', {
    state: (): AlertManagerSettingsStore => {
        const localStorageItem = initServiceSettingsStore<AlertManagerSettingsStore>('alertManager');
        return ({
            alertLastCheckTime: localStorageItem?.alertLastCheckTime ?? '',
        });
    },
    getters: {
        getAlertLastCheckTime: (state): string => state.alertLastCheckTime,
    },
    actions: {
        setAlertLastCheckTime(time: string) {
            this.alertLastCheckTime = time;
        },
    },
});
