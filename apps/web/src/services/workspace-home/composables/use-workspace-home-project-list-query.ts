import { computed } from 'vue';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useWorkspaceHomeProjectListQuery = () => {
    const { projectAPI } = useProjectApi();
    const { key: projectListKey, params } = useServiceQueryKey('identity', 'project', 'list', {
        params: computed(() => ({
            query: {
                only: ['project_id'],
            },
        })),
    });
    return useScopedQuery({
        queryKey: projectListKey,
        queryFn: () => projectAPI.list(params.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['WORKSPACE']);
};
