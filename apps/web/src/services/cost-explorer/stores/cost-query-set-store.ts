import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';

export const useCostQuerySetStore = defineStore('cost-query-set', () => {
    const appContextStore = useAppContextStore();

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        workspaceId: computed(() => appContextStore.getters.workspaceId),
    });
    const state = reactive({
        selectedQuerySetId: undefined as string|undefined,
        selectedDataSourceId: undefined as string|undefined,
        isUnifiedCostOn: _state.isAdminMode as boolean,
    });
    const getters = {
        dataSourceId: computed(() => {
            if (state.isUnifiedCostOn) return UNIFIED_COST_KEY;
            return state.selectedDataSourceId || '';
        }),
    };

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
