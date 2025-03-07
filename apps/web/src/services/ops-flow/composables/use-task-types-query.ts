import type { Ref } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';

export const useTaskTypesQuery = ({
    queryKey,
    enabled,
}: {
  queryKey: Ref<TaskTypeListParameters>;
  enabled?: Ref<boolean>;
}) => {
    const { taskTypeAPI, taskTypeListQueryKey } = useTaskTypeApi();
    const { data: taskTypes, isLoading, refetch } = useQuery({
        queryKey: computed<[QueryKey, TaskTypeListParameters]>(() => [taskTypeListQueryKey.value, queryKey.value]),
        queryFn: async ({ queryKey: qk }) => {
            const { results } = await taskTypeAPI.list(qk[1]);
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
