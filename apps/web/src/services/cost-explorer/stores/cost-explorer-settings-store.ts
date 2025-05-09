import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { initServiceSettingsStore } from '@/store/util';

interface CostExplorerSettingsStore {
    relocateDashboardStatus?: RelocateDashboardStatus;
    showAdjustmentsOverlay?: boolean;
}
export interface RelocateDashboardStatus {
    hideBanner?: boolean;
    hideModal?: boolean;
}

export const useCostExplorerSettingsStore = defineStore('cost-explorer-settings', {
    state: (): CostExplorerSettingsStore => ({
        relocateDashboardStatus: {},
        showAdjustmentsOverlay: false,
    }),
    getters: {
        getRelocateDashboardStatus: (state): CostExplorerSettingsStore['relocateDashboardStatus'] => state.relocateDashboardStatus,
        getShowAdjustmentsOverlay: (state): CostExplorerSettingsStore['showAdjustmentsOverlay'] => state.showAdjustmentsOverlay,
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
        setShowAdjustmentsOverlay(state: CostExplorerSettingsStore['showAdjustmentsOverlay'], userId?: string) {
            this.showAdjustmentsOverlay = state;

            if (!userId) return;
            const settings = LocalStorageAccessor.getItem(userId) ?? {};
            settings.costExplorer = {
                showAdjustmentsOverlay: this.showAdjustmentsOverlay,
            };
        },
        initState(userId?: string) {
            const localStorageItem = initServiceSettingsStore<CostExplorerSettingsStore>('costExplorer', userId);
            this.relocateDashboardStatus = localStorageItem?.relocateDashboardStatus;
            this.showAdjustmentsOverlay = localStorageItem?.showAdjustmentsOverlay;
        },
    },
});
