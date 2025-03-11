import type { Ref } from 'vue';
import { computed } from 'vue';


import { APIError } from '@cloudforet/core-lib/space-connector/error';

import { useTaskTypeQuery } from './use-task-type-query';

export const useCurrentTaskType = ({ taskTypeId }: {
    taskTypeId: Ref<string | undefined>;

}) => {
    const { taskType, error, isLoading } = useTaskTypeQuery({
        queryKey: computed(() => ({
            task_type_id: taskTypeId.value as string,
            include_category_fields: true,
        })),
        enabled: computed(() => !!taskTypeId.value),
    });
    const has403Error = computed(() => !!error.value && error.value instanceof APIError && error.value.status === 403);

    return { currentTaskType: taskType, has403Error, isLoading };
};
