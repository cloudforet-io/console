import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useTaskQuery = ({
    taskId, enabled,
}: {
  taskId: Ref<string|undefined>;
  enabled?: Ref<boolean>;
}) => {
    const { taskAPI } = useTaskApi();

    const { key: taskQueryKey, params: taskParams } = useServiceQueryKey('opsflow', 'task', 'get', {
        contextKey: taskId,
        params: computed(() => ({ task_id: taskId.value as string })),
    });

    const { data, isLoading, error } = useQuery({
        queryKey: taskQueryKey,
        queryFn: async () => {
            const result = await taskAPI.get(taskParams.value);
            return result;
        },
        enabled: computed(() => (enabled ? (enabled.value && !!taskId.value) : !!taskId.value)),
        retry: (failureCount, err) => {
            if ((err as APIError).status === 404) {
                return false;
            }
            return failureCount < 3;
        },
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 15, // 15 seconds
    });

    const queryClient = useQueryClient();
    const setQueryData = (newTask: TaskModel) => {
        queryClient.setQueryData(taskQueryKey.value, newTask);
    };
    const removeQuery = () => {
        queryClient.removeQueries({ queryKey: taskQueryKey.value });
    };
    return {
        data,
        isLoading,
        queryKey: taskQueryKey,
        setQueryData,
        error,
        removeQuery,
    };
};
