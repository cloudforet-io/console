import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWorkspaceGroupWorkspaceListQueryReturn {
    workspacesInWorkspaceGroup: Ref<WorkspaceModel[]>;
    isLoading: Ref<boolean>;
    isError: Ref<boolean>;
    error: Ref<Error|null|unknown>;
}

export const useWorkspaceGroupWorkspaceListQuery = (workspaceGroupId: ComputedRef<string | undefined>): UseWorkspaceGroupWorkspaceListQueryReturn => {
    const { workspaceAPI } = useWorkspaceApi();

    const workspaceListApiQueryHelper = new ApiQueryHelper();
    if (!workspaceGroupId.value) {
        return {
            workspacesInWorkspaceGroup: computed<WorkspaceModel[]>(() => []),
            isLoading: computed(() => false),
            isError: computed(() => true),
            error: computed(() => new Error('workspaceGroupId is required')),
        };
    }

    const { key: workspaceListQueryKey, params: workspaceListQueryParams } = useServiceQueryKey('identity', 'workspace', 'list', {
        params: computed(() => ({
            query: workspaceListApiQueryHelper.setFilters([{ k: 'workspace_group_id', v: workspaceGroupId.value ?? '', o: '=' }]).data,
        })),
    });

    const {
        data: queryData, isLoading, isError, error,
    } = useScopedQuery({
        queryKey: workspaceListQueryKey,
        queryFn: async () => workspaceAPI.list(workspaceListQueryParams.value),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN']);

    return {
        workspacesInWorkspaceGroup: computed<WorkspaceModel[]>(() => queryData.value?.results ?? []),
        isLoading,
        isError: computed(() => isError.value || (!workspaceGroupId)),
        error: computed(() => error.value || (!workspaceGroupId ? new Error('workspaceGroupId is required') : null)),
    };
};
