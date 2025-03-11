import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TaskStatusOptions } from '@/api-clients/opsflow/task/schema/type';

import { useCurrentCategory } from './use-current-category';

export const useCategoryStatusOptions = (ops?: {
  categoryId?: Ref<string | undefined>;
}) => {
    const { categoryId } = ops ?? {};
    // specific category and its status options
    const { currentCategory } = useCurrentCategory({
        categoryId: computed(() => categoryId?.value),
    });
    const getDefaultStatusOptions = () => ({
        TODO: [],
        IN_PROGRESS: [],
        COMPLETED: [],
    });
    const categoryStatusOptions = computed<TaskStatusOptions>(() => {
        if (!currentCategory.value) {
            return getDefaultStatusOptions();
        }
        return currentCategory.value.status_options;
    });

    return { categoryStatusOptions, getDefaultStatusOptions };
};
