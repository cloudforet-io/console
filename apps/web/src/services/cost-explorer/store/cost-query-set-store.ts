import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { managedCostQuerySets } from '@/services/cost-explorer/cost-analysis/config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

interface CostAnalysisLNBState {
    costQuerySetList: CostQuerySetModel[];
    selectedQuerySetId?: string;
    selectedDataSourceId?: string;
}

export const useCostQuerySetStore = defineStore('cost-query-set', {
    state: (): CostAnalysisLNBState => ({
        costQuerySetList: [],
        selectedQuerySetId: undefined,
        selectedDataSourceId: undefined,
    }),
    getters: {
        selectedQuerySet: (state): CostQuerySetModel|undefined => {
            if (!state.selectedQuerySetId) return undefined;
            return state.costQuerySetList.find((item) => item.cost_query_set_id === state.selectedQuerySetId);
        },
    },
    actions: {
        async listCostQuerySets(): Promise<void> {
            // TODO: apply v2
            const fetcher = getCancellableFetcher(SpaceConnector.client.costAnalysis.costQuerySet.list);
            try {
                const { status, response } = await fetcher({
                    data_source_id: this.selectedDataSourceId,
                    query: {
                        filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                    },
                });
                if (status === 'succeed') {
                    this.costQuerySetList = [...managedCostQuerySets, ...response.results];
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                this.costQuerySetList = [...managedCostQuerySets];
            }
        },
    },
});
