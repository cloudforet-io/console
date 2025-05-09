import type { ComputedRef } from 'vue';
import { watch } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskListParameters } from '@/api-clients/opsflow/task/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useAssociatedTasksQuery = ({
    params,
    enabled,
}: {
    params: ComputedRef<TaskListParameters>;
    enabled: ComputedRef<boolean>;
}) => {
    const { taskAPI } = useTaskApi();
    const { key: taskListQueryKey, params: taskListParams } = useServiceQueryKey('opsflow', 'task', 'list', {
        params,
    });
    const {
        data: tasks, isLoading, isError, refetch,
    } = useQuery({
        queryKey: taskListQueryKey,
        queryFn: async () => {
            const { results } = await taskAPI.list(taskListParams.value);
            return results ?? [];
        },
        enabled,
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60 * 2, // 2 minutes
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
