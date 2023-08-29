import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CostQuerySetModel } from '@/services/cost-explorer/type';

interface CostAnalysisLNBState {
    costQueryList: CostQuerySetModel[];
    dataSourceList: string[];
    selectedQueryId?: string;
    selectedDataSource?: string;
}

export const useCostAnalysisLNBStore = defineStore('cost-analysis-l-n-b', {
    state: (): CostAnalysisLNBState => ({
        costQueryList: [],
        dataSourceList: [],
        selectedQueryId: undefined,
        selectedDataSource: undefined,
    }),
    getters: {
        selectedQuerySet: (state): CostQuerySetModel|undefined => {
            if (!state.selectedQueryId) return undefined;
            return state.costQueryList.find((item) => item.cost_query_set_id === state.selectedQueryId);
        },
    },
    actions: {
        async listCostQueryList(): Promise<void> {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list({
                    query: {
                        filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                    },
                });
                this.costQueryList = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.costQueryList = [];
            }
        },
    },
});
