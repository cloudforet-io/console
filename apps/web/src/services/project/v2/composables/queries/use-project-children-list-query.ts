import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useProjectChildrenListQuery = (projectGroupId: ComputedRef<string|undefined>) => {
    const { projectAPI } = useProjectApi();
    const { key: projectListQueryKey, params: projectListQueryParams } = useServiceQueryKey('identity', 'project', 'list', {
        params: computed(() => ({
            project_group_id: projectGroupId.value,
            include_children: true,
        })),
    });
    return useScopedQuery({
        queryKey: projectListQueryKey,
        queryFn: () => projectAPI.list(projectListQueryParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!projectGroupId.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
