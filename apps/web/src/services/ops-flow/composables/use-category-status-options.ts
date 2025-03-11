import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TaskStatusOptions } from '@/api-clients/opsflow/task/schema/type';

import { useCurrentCategory } from './use-current-category';

export const useCategoryStatusOptions = ({ categoryId }: {
  categoryId: Ref<string | undefined>;
}) => {
    // specific category and its status options
    const { currentCategory } = useCurrentCategory({ categoryId });
    const categoryStatusOptions = computed<TaskStatusOptions>(() => {
        if (!currentCategory.value) {
            return {
                TODO: [],
                IN_PROGRESS: [],
                COMPLETED: [],
            };
        }
        return currentCategory.value.status_options;
    });

    return { categoryStatusOptions };
};
