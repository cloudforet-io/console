import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TaskStatusOptions, TaskStatusOptionWithOptionalId, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';

import { useCategoryQuery } from './use-current-category';

export const useCategoryStatusOptions = (ops?: {
  categoryId?: Ref<string | undefined>;
}) => {
    const { categoryId } = ops ?? {};
    // specific category and its status options
    const { data: currentCategory, isLoading } = useCategoryQuery({
        categoryId: computed(() => categoryId?.value),
    });
    const getDefaultStatusOptions = (): Record<TaskStatusType, TaskStatusOptionWithOptionalId[]> => ({
        TODO: [
            {
                name: TASK_STATUS_LABELS.TODO,
                color: 'blue200',
                is_default: true,
            },
        ],
        IN_PROGRESS: [
            {
                name: TASK_STATUS_LABELS.IN_PROGRESS,
                color: 'yellow200',
                is_default: true,
            },
        ],
        COMPLETED: [
            {
                name: TASK_STATUS_LABELS.COMPLETED,
                color: 'green200',
                is_default: true,
            },
        ],
    });
    const categoryStatusOptions = computed<TaskStatusOptions|undefined>(() => {
        if (isLoading.value) return undefined;
        if (!currentCategory.value) {
            return {
                TODO: [],
                IN_PROGRESS: [],
                COMPLETED: [],
            };
        }
        return currentCategory.value.status_options;
    });

    return { categoryStatusOptions, getDefaultStatusOptions };
};
