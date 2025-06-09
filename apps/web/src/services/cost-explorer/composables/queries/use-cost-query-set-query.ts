import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useCostQuerySetApi } from '@/api-clients/cost-analysis/cost-query-set/composables/use-cost-query-set-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

export const useCostQuerySetQuery = (data_source_id: string) => {
    const appContextStore = useAppContextStore();
    const userStore = useUserStore();
    const _userId = computed<string>(() => userStore.state.userId ?? '');
    const _isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
    const _workspaceId = computed<string|undefined>(() => appContextStore.getters.workspaceId);

    const queryHelper = computed(() => {
        const helper = new ApiQueryHelper().setSort('created_at', true);
        helper.setFilters([{ k: 'user_id', v: _userId.value, o: '=' }]);
        if (_isAdminMode.value) {
            helper.setFilters([{ k: 'workspace_id', v: null, o: '=' }]);
        } else {
            helper.setFilters([{ k: 'workspace_id', v: _workspaceId.value ?? '', o: '=' }]);
        }
        return helper;
    });

    const { costQuerySetAPI } = useCostQuerySetApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost-query-set', 'list', {
        params: computed(() => ({
            data_source_id,
            query: queryHelper.value.data,
        })),
    });
    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => costQuerySetAPI.list(params.value),
        select: (d) => d.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costQuerySetList: data, isLoading, error,
    };
};
