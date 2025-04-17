import { computed, type Ref } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupGetParameters } from '@/api-clients/identity/project-group/schema/api-verbs/get';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useProjectGroupQuery = ({
    projectGroupId,
    enabled,
}: {
  projectGroupId: Ref<string|undefined>;
  enabled?: Ref<boolean>;
}) => {
    const { projectGroupAPI } = useProjectGroupApi();
    const { key: projectGroupQueryKey, params } = useServiceQueryKey('identity', 'project', 'get', {
        params: computed<ProjectGroupGetParameters>(() => ({ project_group_id: projectGroupId.value as string })),
    });
    const projectGroupQuery = useScopedQuery({
        queryKey: projectGroupQueryKey,
        queryFn: () => projectGroupAPI.get(params.value),
        enabled: computed(() => {
            if (!projectGroupId.value) return false;
            return enabled ? enabled.value : true;
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['WORKSPACE']);

    const queryClient = useQueryClient();
    const setQueryData = (newData: ProjectGroupModel) => {
        queryClient.setQueryData(projectGroupQueryKey.value, newData);
    };
    const invalidateQuery = () => {
        queryClient.invalidateQueries({ queryKey: projectGroupQueryKey.value });
    };
    const { key: projectGroupListQueryKey } = useServiceQueryKey('identity', 'project-group', 'list');
    const invalidateAllQueries = () => {
        queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
    };

    return {
        ...projectGroupQuery,
        setQueryData,
        invalidateQuery,
        invalidateAllQueries,
    };
};
