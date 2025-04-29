import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import type { TaskTypeGetParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useTaskTypeQuery = ({
    taskTypeId, params, enabled,
}: {
  taskTypeId: Ref<string | undefined>;
  params: Ref<TaskTypeGetParameters>;
  enabled?: Ref<boolean>;
}) => {
    const { taskTypeAPI } = useTaskTypeApi();
    const { key: taskTypeQueryKey, params: taskTypeParams } = useServiceQueryKey('opsflow', 'task-type', 'get', {
        contextKey: taskTypeId,
        params: computed(() => params.value),
    });

    const { data: taskType, error, isLoading } = useQuery({
        queryKey: taskTypeQueryKey,
        queryFn: () => taskTypeAPI.get(taskTypeParams.value),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });

    return {
        taskType, error, isLoading,
    };
};
