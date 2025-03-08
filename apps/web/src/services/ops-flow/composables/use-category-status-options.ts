import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TaskStatusOptions } from '@/api-clients/opsflow/task/schema/type';

import { useCategoriesQuery } from './use-categories-query';

export const useCategoryStatusOptions = ({ categoryId }: {
  categoryId: Ref<string | undefined>;
}) => {
    const { categories } = useCategoriesQuery();

    // specific category and its status options
    const currentCategory = computed(() => categories.value?.find((c) => c.category_id === categoryId?.value));
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
