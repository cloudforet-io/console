import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import type { TaskTypeGetParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/get';

export const useTaskTypeQuery = ({
    queryKey, enabled,
}: {
  queryKey: Ref<TaskTypeGetParameters>;
  enabled?: Ref<boolean>;
}) => {
    const { taskTypeAPI, taskTypeQueryKey } = useTaskTypeApi();
    const { data: taskType, error, isLoading } = useQuery({
        queryKey: computed(() => [
            ...taskTypeQueryKey.value,
            queryKey.value,
        ]),
        queryFn: () => taskTypeAPI.get(queryKey.value),
        enabled,
    });

    return {
        taskType, error, isLoading,
    };
};
