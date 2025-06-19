import type { Ref } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useProjectGroupsQuery = (ops?: { enabled: Ref<boolean> }) => {
    const { projectGroupAPI } = useProjectGroupApi();
    const projectGroupsApiQuery = new ApiQueryHelper().setOnly('name', 'project_group_id');
    const { key: projectGroupListQueryKey, params } = useServiceQueryKey('identity', 'project-group', 'list', {
        params: {
            query: projectGroupsApiQuery.data,
        },
    });
    const { data, isLoading, error } = useScopedQuery({
        queryKey: projectGroupListQueryKey,
        queryFn: async () => {
            const res = await projectGroupAPI.list(params.value);
            return res.results ?? [];
        },
        enabled: ops?.enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['WORKSPACE']);

    return {
        data, isLoading, error,
    };
};
