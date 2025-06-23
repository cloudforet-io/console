import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { CostQuerySetModel } from '@/api-clients/cost-analysis/cost-query-set/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

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
    };
    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
