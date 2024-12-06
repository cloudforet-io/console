import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { initServiceSettingsStore } from '@/store/util';

interface CostExplorerSettingsStore {
    relocateDashboardStatus?: RelocateDashboardStatus;
}
export interface RelocateDashboardStatus {
    hideBanner?: boolean;
    hideModal?: boolean;
}

export const useCostExplorerSettingsStore = defineStore('cost-explorer-settings', {
    state: (): CostExplorerSettingsStore => ({
        relocateDashboardStatus: {},
    }),
    getters: {
        getRelocateDashboardStatus: (state): CostExplorerSettingsStore['relocateDashboardStatus'] => state.relocateDashboardStatus,
    },
    actions: {
        setRelocateDashboardState(state: CostExplorerSettingsStore['relocateDashboardStatus'], userId?: string) {
            this.relocateDashboardStatus = state;

            if (!userId) return;
            const settings = LocalStorageAccessor.getItem(userId) ?? {};
            settings.costExplorer = {
                relocateDashboardStatus: this.relocateDashboardStatus,
            };
            LocalStorageAccessor.setItem(userId, settings);
        },
        initState(userId?: string) {
            const localStorageItem = initServiceSettingsStore<CostExplorerSettingsStore>('costExplorer', userId);
            this.relocateDashboardStatus = localStorageItem?.relocateDashboardStatus;
        },
    },
});
