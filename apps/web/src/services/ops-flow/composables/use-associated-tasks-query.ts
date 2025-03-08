import type { Ref } from 'vue';
import { computed, watch } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskListParameters } from '@/api-clients/opsflow/task/schema/api-verbs/list';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useAssociatedTasksQuery = ({
    queryKey,
    enabled,
}: {
  queryKey: Ref<TaskListParameters>;
  enabled: Ref<boolean>;
}) => {
    const { taskListQueryKey, taskAPI } = useTaskApi();
    const {
        data: tasks, isLoading, isError, refetch,
    } = useQuery({
        queryKey: computed(() => [
            ...taskListQueryKey.value,
            queryKey.value,
        ]),
        queryFn: async () => {
            const { results } = await taskAPI.list(queryKey.value);
            return results ?? [];
        },
        enabled,
        // time control
        gcTime: 1000 * 60 * 2, // 2 minutes
        staleTime: 1000 * 30, // 30 seconds
    });
    watch(isError, (error) => {
        if (error) {
            ErrorHandler.handleError(error);
        }
    });

    return {
        tasks,
        isLoading,
        refetch,
    };
};
