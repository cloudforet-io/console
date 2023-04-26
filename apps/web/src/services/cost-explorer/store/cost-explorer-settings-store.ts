import { defineStore } from 'pinia';

import { initServiceSettingsStore } from '@/store/util';

import type { MoreGroupByItem } from '@/services/cost-explorer/type';

interface CostExplorerSettingsState {
    homeDashboardId: string;
    costAnalysisMoreGroupBy: MoreGroupByItem[];
}


export const useCostExplorerSettingsStore = defineStore('cost-explorer-settings', {
    state: (): CostExplorerSettingsState => {
        const localStorageItem = initServiceSettingsStore<CostExplorerSettingsState>('costExplorer');
        return ({
            homeDashboardId: localStorageItem?.homeDashboardId || '',
            costAnalysisMoreGroupBy: localStorageItem?.costAnalysisMoreGroupBy || [],
        });
    },
    actions: {
        setHomeDashboardId(id: string) {
            this.homeDashboardId = id;
        },
        setCostAnalysisMoreGroupBy(moreGroupBy: MoreGroupByItem[]) {
            this.costAnalysisMoreGroupBy = moreGroupBy;
        },
    },
});
