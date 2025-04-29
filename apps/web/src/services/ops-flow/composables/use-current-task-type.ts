import type { Ref } from 'vue';
import { computed } from 'vue';


import { useTaskTypeQuery } from './use-task-type-query';

export const useCurrentTaskType = ({ taskTypeId }: {
    taskTypeId: Ref<string | undefined>;

}) => {
    const { taskType, error, isLoading } = useTaskTypeQuery({
        taskTypeId: computed(() => taskTypeId.value),
        params: computed(() => ({
            task_type_id: taskTypeId.value as string,
            include_category_fields: true,
        })),
        enabled: computed(() => !!taskTypeId.value),
    });

    return { currentTaskType: taskType, error, isLoading };
};
