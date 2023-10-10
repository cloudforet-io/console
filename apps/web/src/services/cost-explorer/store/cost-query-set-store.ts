import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { defineStore } from 'pinia';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ManagedCostQuerySets } from '@/services/cost-explorer/cost-analysis/config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.costQuerySet.list);

interface CostQuerySetState {
    costQuerySetList: CostQuerySetModel[];
    selectedQuerySetId?: string;
    selectedDataSourceId?: string;
}

const store = useStore();

export const useCostQuerySetStore = defineStore('cost-query-set', {
    state: (): CostQuerySetState => ({
        costQuerySetList: [],
        selectedQuerySetId: undefined,
        selectedDataSourceId: undefined,
    }),
    getters: {
        selectedQuerySet: (state): CostQuerySetModel|undefined => {
            if (!state.selectedQuerySetId) return undefined;
            return state.costQuerySetList.find((item) => item.cost_query_set_id === state.selectedQuerySetId);
        },
        managedCostQuerySets: (state): CostQuerySetModel[] => {
            if (!state.selectedDataSourceId) return [];
            return ManagedCostQuerySets.map((item) => ({
                ...item,
                data_source_id: state.selectedDataSourceId,
            })) as CostQuerySetModel[];
        },
    },
    actions: {
        async listCostQuerySets(): Promise<void> {
            if (!this.selectedDataSourceId) {
                this.costQuerySetList = [...this.managedCostQuerySets];
                return;
            }
            try {
                const { status, response } = await fetcher({
                    data_source_id: this.selectedDataSourceId,
                    query: {
                        filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                    },
                });
                if (status === 'succeed' && response?.results) {
                    this.costQuerySetList = [...this.managedCostQuerySets, ...response.results];
                } else {
                    this.costQuerySetList = [...this.managedCostQuerySets];
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                this.costQuerySetList = [...this.managedCostQuerySets];
            }
        },
    },
});
