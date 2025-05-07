import { toValue } from '@vueuse/core';
import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useProjectQuery = ({
    projectId,
    enabled,
}: {
  projectId: Ref<string|undefined>;
enabled?: Ref<boolean>|boolean;
}) => {
    const { projectAPI } = useProjectApi();
    const { key: projectQueryKey, params } = useServiceQueryKey('identity', 'project', 'get', {
        contextKey: projectId,
        params: computed<ProjectGetParameters>(() => ({ project_id: projectId.value as string })),
    });

    const projectQuery = useScopedQuery({
        queryKey: projectQueryKey,
        queryFn: () => projectAPI.get(params.value),
        enabled: computed(() => {
            if (!projectId.value) return false;
            if (enabled === undefined) return true;
            return toValue(enabled);
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['WORKSPACE']);

    const queryClient = useQueryClient();
    const invalidateQuery = () => {
        if (projectId.value) {
            queryClient.invalidateQueries({ queryKey: projectQueryKey.value });
        }
    };
    const setQueryData = (newData: any) => {
        queryClient.setQueryData(projectQueryKey, newData);
    };

    const { key: projectListQueryKey } = useServiceQueryKey('identity', 'project', 'list');
    const invalidateAllQueries = () => {
        queryClient.invalidateQueries({ queryKey: projectListQueryKey.value });
    };

    return {
        ...projectQuery, invalidateQuery, setQueryData, invalidateAllQueries,
    };
};
