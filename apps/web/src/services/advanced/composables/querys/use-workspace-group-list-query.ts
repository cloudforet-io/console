import type { Ref } from 'vue';
import { computed } from 'vue';

import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWorkspaceGroupListQueryReturn {
    workspaceGroupListData: Ref<WorkspaceGroupModel[]>;
}

export const useWorkspaceGroupListQuery = (): UseWorkspaceGroupListQueryReturn => {
    const { workspaceGroupAPI } = useWorkspaceGroupApi();

    const { key: workspaceGroupListQueryKey, params: workspaceGroupListQueryParams } = useServiceQueryKey('identity', 'workspace-group', 'list');

    const { data: queryData } = useScopedQuery({
        queryKey: workspaceGroupListQueryKey,
        queryFn: async () => workspaceGroupAPI.list(workspaceGroupListQueryParams.value),
        initialData: {
            results: [],
            total_count: 0,
        },
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN']);

    return {
        workspaceGroupListData: computed<WorkspaceGroupModel[]>(() => queryData.value?.results ?? []),
    };
};
