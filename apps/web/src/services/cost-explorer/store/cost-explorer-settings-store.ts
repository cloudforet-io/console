import { defineStore } from 'pinia';

import { store } from '@/store';

import type { MoreGroupByItem } from '@/services/cost-explorer/type';

interface CostExplorerSettingsState {
    homeDashboardId: string;
    costAnalysisMoreGroupBy: MoreGroupByItem[];
}

const getLocalStorageItem = (service: string): CostExplorerSettingsState | undefined => {
    const userId = store.state.user.userId;
    if (userId) {
        const userSettings = JSON.parse(window.localStorage.getItem(userId) || '{}');
        const userSettingsObject = userSettings;
        return userSettingsObject[service] || {};
    }
    return undefined;
};


export const useCostExplorerSettingsStore = defineStore('cost-explorer-settings', {
    state: (): CostExplorerSettingsState => {
        const localStorageItem = getLocalStorageItem('costExplorer');
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
