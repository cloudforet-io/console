import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useTaskTypesQuery = ({
    params,
    enabled,
}: {
  params: Ref<TaskTypeListParameters>;
  enabled?: Ref<boolean>;
}) => {
    const { taskTypeAPI } = useTaskTypeApi();
    const { key: taskTypeListQueryKey, params: taskTypeListParams } = useServiceQueryKey('opsflow', 'task-type', 'list', {
        params: computed(() => params.value),
    });

    const { data: taskTypes, isLoading, refetch } = useQuery({
        queryKey: taskTypeListQueryKey,
        queryFn: async () => {
            const { results } = await taskTypeAPI.list(taskTypeListParams.value);
            return results ?? [];
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });
    return {
        taskTypes,
        isLoading,
        refetch,
    };
};
