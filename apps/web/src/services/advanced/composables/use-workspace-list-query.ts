import type { Ref } from 'vue';
import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWorkspaceListQueryReturn {
    workspaceListData: Ref<WorkspaceModel[]>;
}

export const useWorkspaceListQuery = (): UseWorkspaceListQueryReturn => {
    const { workspaceAPI } = useWorkspaceApi();

    const workspaceListApiQueryHelper = new ApiQueryHelper()
        .setFilters([{ k: 'state', v: 'ENABLED', o: '=' }]);

    const { key: workspaceListQueryKey, params: workspaceListQueryParams } = useServiceQueryKey('identity', 'workspace', 'list', {
        params: computed(() => ({
            query: workspaceListApiQueryHelper.data,
        })),
    });

    const { data: queryData } = useScopedQuery({
        queryKey: workspaceListQueryKey,
        queryFn: async () => workspaceAPI.list(workspaceListQueryParams.value),
        initialData: {
            results: [],
            total_count: 0,
        },
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN']);

    return {
        workspaceListData: computed<WorkspaceModel[]>(() => queryData.value?.results ?? []),
    };
};
