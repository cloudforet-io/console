import type { Ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';

export const useProjectGroupsQuery = (ops?: { enabled: Ref<boolean> }) => {
    const { projectGroupAPI, projectGroupListQueryKey } = useProjectGroupApi();
    const projectGroupsApiQuery = new ApiQueryHelper().setOnly('name', 'project_group_id');
    const { data, isLoading, error } = useQuery({
        queryKey: projectGroupListQueryKey,
        queryFn: async () => {
            const res = await projectGroupAPI.list({
                query: projectGroupsApiQuery.data,
            });
            return res.results ?? [];
        },
        enabled: ops?.enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    });

    return {
        data, isLoading, error,
    };
};
