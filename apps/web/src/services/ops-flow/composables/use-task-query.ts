import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

export const useTaskQuery = ({
    taskId, enabled,
}: {
  taskId: Ref<string|undefined>;
  enabled?: Ref<boolean>;
}) => {
    const { taskQueryKey, taskAPI } = useTaskApi();
    const queryKey = computed(() => [...taskQueryKey.value, taskId.value]);
    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            const result = await taskAPI.get({ task_id: taskId.value as string });
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
        queryClient.setQueryData(queryKey.value, newTask);
    };
    return {
        data,
        isLoading,
        queryKey,
        setQueryData,
        error,
    };
};
