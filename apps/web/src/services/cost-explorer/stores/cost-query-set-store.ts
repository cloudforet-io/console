import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ADMIN_MANAGED_COST_QUERY_SET_LIST, MANAGED_COST_QUERY_SET_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';


export const useCostQuerySetStore = defineStore('cost-query-set', () => {
    const appContextStore = useAppContextStore();

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        workspaceId: computed(() => appContextStore.getters.workspaceId),
    });
    const state = reactive({
        costQuerySetList: [] as CostQuerySetModel[],
        selectedQuerySetId: undefined as string|undefined,
        selectedDataSourceId: undefined as string|undefined,
    });

    const getters = reactive({
        selectedQuerySet: computed<CostQuerySetModel|undefined>(() => {
            if (!state.selectedQuerySetId) return undefined;
            return state.costQuerySetList.find((item) => item.cost_query_set_id === state.selectedQuerySetId);
        }),
        managedCostQuerySets: computed<CostQuerySetModel[]>(() => {
            if (!state.selectedDataSourceId) return [];
            let _managedCostQuerySetList = MANAGED_COST_QUERY_SET_LIST;
            if (_state.isAdminMode) _managedCostQuerySetList = ADMIN_MANAGED_COST_QUERY_SET_LIST;
            return _managedCostQuerySetList.map((item) => ({
                ...item,
                data_source_id: state.selectedDataSourceId,
            })) as CostQuerySetModel[];
        }),
    });

    /* Mutations */
    const setSelectedDataSourceId = (dataSourceId?: string): void => {
        state.selectedDataSourceId = dataSourceId;
    };
    const setSelectedQuerySetId = (querySetId?: string): void => {
        state.selectedQuerySetId = querySetId;
    };

    /* Actions */
    const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.costQuerySet.list);
    const listCostQuerySets = async (): Promise<void> => {
        if (!state.selectedDataSourceId) {
            state.costQuerySetList = [...getters.managedCostQuerySets];
            return;
        }

        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([{ k: 'user_id', v: store.state.user.userId, o: '=' }]);
        if (_state.isAdminMode) {
            apiQueryHelper.addFilter({ k: 'workspace_id', v: null, o: '=' });
        } else {
            apiQueryHelper.addFilter({ k: 'workspace_id', v: _state.workspaceId as string, o: '=' });
        }
        try {
            const { status, response } = await fetcher({
                data_source_id: state.selectedDataSourceId,
                query: apiQueryHelper.data,
            });
            if (status === 'succeed' && response?.results) {
                state.costQuerySetList = [...getters.managedCostQuerySets, ...response.results];
            } else {
                state.costQuerySetList = [...getters.managedCostQuerySets];
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            state.costQuerySetList = [...getters.managedCostQuerySets];
        }
    };
    const reset = (): void => {
        state.costQuerySetList = [];
        state.selectedDataSourceId = undefined;
        state.selectedQuerySetId = undefined;
    };


    const mutations = {
        setSelectedDataSourceId,
        setSelectedQuerySetId,
    };
    const actions = {
        reset,
        listCostQuerySets,
    };
    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
