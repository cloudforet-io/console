import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';

export const useTaskTypesQuery = (params: TaskTypeListParameters = {}) => {
    const { taskTypeAPI, taskTypeListQueryKey } = useTaskTypeApi();
    const { data: taskTypes, isLoading, refetch } = useQuery({
        queryKey: computed<QueryKey>(() => [...taskTypeListQueryKey.value, params]),
        queryFn: async () => {
            const { results } = await taskTypeAPI.list(params);
            return results ?? [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });
    return {
        taskTypes,
        isLoading,
        refetch,
    };
};
