import type { Ref } from 'vue';
import { computed, watch } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskListParameters } from '@/api-clients/opsflow/task/schema/api-verbs/list';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

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
    } = useQuery<TaskModel[], APIError, TaskModel[], [QueryKey, TaskListParameters]>({
        queryKey: computed(() => [
            taskListQueryKey.value,
            queryKey.value,
        ]),
        queryFn: async ({ queryKey: qk }) => {
            const [, params] = qk;
            const { results } = await taskAPI.list(params);
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
