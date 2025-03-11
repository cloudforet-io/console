import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskGetParameters } from '@/api-clients/opsflow/task/schema/api-verbs/get';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

export const useTaskQuery = ({
    queryKey, enabled,
}: {
  queryKey: Ref<TaskGetParameters>;
  enabled?: Ref<boolean>;
}) => {
    const { taskQueryKey, taskAPI } = useTaskApi();
    const qk = computed(() => [...taskQueryKey.value, queryKey.value]);
    const { data: task, isLoading } = useQuery({
        queryKey: qk,
        queryFn: async () => {
            const result = await taskAPI.get(queryKey.value);
            return result;
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 0,
    });

    const queryClient = useQueryClient();
    const setQueryData = (newTask: TaskModel) => {
        queryClient.setQueryData(qk.value, newTask);
    };
    return {
        task,
        isLoading,
        queryKey: qk,
        setQueryData,
    };
};
