import { computed } from 'vue';

import { useUserProfileApi } from '@/api-clients/identity/user-profile/composables/use-user-profile-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useWorkspaceMap = () => {
    const { userProfileAPI } = useUserProfileApi();

    const { key, params } = useServiceQueryKey('identity', 'user-profile', 'get-workspaces');
    const { data: workspaceList, isFetching: isFetchingWorkspaceList } = useScopedQuery({
        queryKey: key,
        queryFn: () => userProfileAPI.getWorkspaces(params.value),
        select: (data) => data.results || [],
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['WORKSPACE', 'USER']);


    return {
        map: computed(() => {
            const workspaceMap = new Map<string, WorkspaceModel>();
            workspaceList.value?.forEach((workspace) => {
                workspaceMap.set(workspace.workspace_id, workspace);
            });
            return workspaceMap;
        }),
        loading: isFetchingWorkspaceList,
    };
};
