import { defineStore } from 'pinia';

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
        setRelocateDashboardState(state: CostExplorerSettingsStore['relocateDashboardStatus']) {
            this.relocateDashboardStatus = state;
        },
        initState() {
            const localStorageItem = initServiceSettingsStore<CostExplorerSettingsStore>('costExplorer');
            this.relocateDashboardStatus = localStorageItem?.relocateDashboardStatus;
        },
    },
});
