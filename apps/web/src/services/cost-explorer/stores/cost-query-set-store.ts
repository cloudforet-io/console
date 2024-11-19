import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { ADMIN_MANAGED_COST_QUERY_SET_LIST, MANAGED_COST_QUERY_SET_IDS, MANAGED_COST_QUERY_SET_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';


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
        isUnifiedCostOn: _state.isAdminMode as boolean,
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
            if (state.isUnifiedCostOn) _managedCostQuerySetList = _managedCostQuerySetList.filter((item) => item.cost_query_set_id !== MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT);
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
    const setUnifiedCostOn = (value: boolean) => {
        state.isUnifiedCostOn = value;
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
                data_source_id: state.isUnifiedCostOn ? UNIFIED_COST_KEY : state.selectedDataSourceId,
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
        state.isUnifiedCostOn = _state.isAdminMode;
    };


    const mutations = {
        setSelectedDataSourceId,
        setSelectedQuerySetId,
        setUnifiedCostOn,
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
