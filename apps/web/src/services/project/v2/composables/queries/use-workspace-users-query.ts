import type { Ref } from 'vue';

import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


export const useWorkspaceUsersQuery = (ops?: {
  enabled?: Ref<boolean>|boolean
 }) => {
    const { enabled } = ops ?? {};
    const { workspaceUserAPI } = useWorkspaceUserApi();
    const { key: workspaceUserListQueryKey } = useServiceQueryKey('identity', 'workspace-user', 'list');
    const { data, error } = useScopedQuery({
        queryKey: workspaceUserListQueryKey,
        queryFn: async () => {
            const res = await workspaceUserAPI.list({});
            return res.results ?? [];
        },
        enabled,
        staleTime: 1000 * 60 * 20, // 10 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    }, ['WORKSPACE']);


    return {
        data,
        error,
    };
};
