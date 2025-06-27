import { toValue } from '@vueuse/core';
import {
    computed, type ComputedRef,
} from 'vue';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useCostQuerySetApi } from '@/api-clients/cost-analysis/cost-query-set/composables/use-cost-query-set-api';
import type { CostQuerySetModel } from '@/api-clients/cost-analysis/cost-query-set/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { ADMIN_MANAGED_COST_QUERY_SET_LIST, MANAGED_COST_QUERY_SET_IDS, MANAGED_COST_QUERY_SET_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';

interface UseCostQuerySetQueryOptions {
    data_source_id: ComputedRef<string>;
    isUnifiedCostOn?: ComputedRef<boolean>;
    selectedQuerySetId?: ComputedRef<string | undefined>;
}

export const useCostQuerySetQuery = (options: UseCostQuerySetQueryOptions) => {
    const appContextStore = useAppContextStore();
    const userStore = useUserStore();
    const _userId = computed<string>(() => userStore.state.userId ?? '');
    const _isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
    const _workspaceId = computed<string|undefined>(() => appContextStore.getters.workspaceId);

    // Convert options to computed refs for reactivity
    const _dataSourceId = computed(() => toValue(options.data_source_id));
    const _isUnifiedCostOn = computed(() => toValue(options.isUnifiedCostOn) ?? false);
    const _selectedQuerySetId = computed(() => toValue(options.selectedQuerySetId));

    // Check if query should be enabled
    const isQueryEnabled = computed(() => !!_dataSourceId.value && _dataSourceId.value.trim() !== '');

    // Managed cost query sets logic
    const managedCostQuerySets = computed<CostQuerySetModel[]>(() => {
        if (!_dataSourceId.value) return [];
        let _managedCostQuerySetList = MANAGED_COST_QUERY_SET_LIST;
        if (_isAdminMode.value) _managedCostQuerySetList = ADMIN_MANAGED_COST_QUERY_SET_LIST;
        if (_isUnifiedCostOn.value) _managedCostQuerySetList = _managedCostQuerySetList.filter((item) => item.cost_query_set_id !== MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT);
        return _managedCostQuerySetList.map((item) => ({
            ...item,
            data_source_id: _dataSourceId.value,
        })) as CostQuerySetModel[];
    });

    const queryHelper = computed(() => {
        const helper = new ApiQueryHelper().setSort('created_at', true);
        const filters: ConsoleFilter[] = [{ k: 'user_id', v: _userId.value, o: '=' }];
        if (_isAdminMode.value) {
            filters.push({ k: 'workspace_id', v: null, o: '=' });
        } else {
            filters.push({ k: 'workspace_id', v: _workspaceId.value ?? '', o: '=' });
        }
        helper.setFilters(filters);
        return helper;
    });

    const { costQuerySetAPI } = useCostQuerySetApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost-query-set', 'list', {
        params: computed(() => ({
            data_source_id: _isUnifiedCostOn.value ? UNIFIED_COST_KEY : _dataSourceId.value,
            query: queryHelper.value.data,
        })),
    });

    const {
        data, isLoading, error, refetch,
    } = useScopedQuery({
        queryKey: key,
        queryFn: () => costQuerySetAPI.list(params.value),
        select: (d) => [...managedCostQuerySets.value, ...(d.results ?? [])],
        enabled: isQueryEnabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    // Selected query set logic
    const selectedQuerySet = computed<CostQuerySetModel|undefined>(() => {
        if (!_selectedQuerySetId.value || !data.value) return undefined;
        return data.value.find((item) => item.cost_query_set_id === _selectedQuerySetId.value);
    });

    return {
        costQuerySetList: data,
        isLoading,
        error,
        refetch,
        managedCostQuerySets,
        selectedQuerySet,
    };
};
