import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { defineStore } from 'pinia';


import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { managedCostQuerySets } from '@/services/cost-explorer/cost-analysis/config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

interface CostAnalysisLNBState {
    costQuerySetList: CostQuerySetModel[];
    dataSourceList: string[];
    selectedQuerySetId?: string;
    selectedDataSource?: string;
}

export const useCostQuerySetStore = defineStore('cost-query-set', {
    state: (): CostAnalysisLNBState => ({
        costQuerySetList: [],
        dataSourceList: [],
        selectedQuerySetId: undefined,
        selectedDataSource: undefined,
    }),
    getters: {
        selectedQuerySet: (state): CostQuerySetModel|undefined => {
            if (!state.selectedQuerySetId) return undefined;
            return state.costQuerySetList.find((item) => item.cost_query_set_id === state.selectedQuerySetId);
        },
    },
    actions: {
        async listCostQuerySets(): Promise<void> {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list({
                    query: {
                        filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                    },
                });
                this.costQuerySetList = [...managedCostQuerySets, ...results];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.costQuerySetList = [...managedCostQuerySets];
            }
        },
    },
});
