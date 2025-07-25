import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useWorkspaceGroupWorkspaceListQuery = (workspaceGroupId: ComputedRef<string | undefined>) => {
    const { workspaceAPI } = useWorkspaceApi();

    const workspaceListApiQueryHelper = new ApiQueryHelper();

    const { key: workspaceListQueryKey, params: workspaceListQueryParams } = useServiceQueryKey('identity', 'workspace', 'list', {
        params: computed(() => ({
            query: workspaceListApiQueryHelper.setFilters([{ k: 'workspace_group_id', v: workspaceGroupId.value ?? '', o: '=' }]).data,
        })),
    });

    return useScopedQuery({
        queryKey: workspaceListQueryKey,
        queryFn: async () => workspaceAPI.list(workspaceListQueryParams.value),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
        enabled: !!workspaceGroupId.value,
    }, ['DOMAIN']);
};
