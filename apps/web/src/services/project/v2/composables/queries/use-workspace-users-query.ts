import type { Ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';


export const useWorkspaceUsersQuery = (ops?: {
  enabled?: Ref<boolean>|boolean
 }) => {
    const { enabled } = ops ?? {};
    const { workspaceUserAPI, workspaceUserListQueryKey } = useWorkspaceUserApi();
    const { data, error } = useQuery({
        queryKey: workspaceUserListQueryKey,
        queryFn: async () => {
            const res = await workspaceUserAPI.list({});
            return res.results ?? [];
        },
        enabled,
        staleTime: 1000 * 60 * 20, // 10 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });


    return {
        data,
        error,
    };
};
