import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';

import type { MoreGroupByItem } from '@/services/cost-explorer/type';

interface CostExplorerSettingsState {
    costAnalysisMoreGroupBy: MoreGroupByItem[];
}


export const useCostExplorerSettingsStore = defineStore('cost-explorer-settings', {
    state: (): CostExplorerSettingsState => ({
        costAnalysisMoreGroupBy: [],
    }),
    actions: {
        setCostAnalysisMoreGroupBy(moreGroupBy: MoreGroupByItem[]) {
            this.costAnalysisMoreGroupBy = moreGroupBy;
        },
        initState() {
            const localStorageItem = initServiceSettingsStore<CostExplorerSettingsState>('costExplorer');
            this.costAnalysisMoreGroupBy = localStorageItem?.costAnalysisMoreGroupBy || [];
        },
    },
});
