import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TaskStatusOptions } from '@/api-clients/opsflow/task/schema/type';

import { useCurrentCategory } from './use-current-category';

export const useCategoryStatusOptions = (ops?: {
  categoryId?: Ref<string | undefined>;
}) => {
    const { categoryId } = ops ?? {};
    // specific category and its status options
    const { currentCategory, isLoading } = useCurrentCategory({
        categoryId: computed(() => categoryId?.value),
    });
    const getDefaultStatusOptions = () => ({
        TODO: [],
        IN_PROGRESS: [],
        COMPLETED: [],
    });
    const categoryStatusOptions = computed<TaskStatusOptions|undefined>(() => {
        if (isLoading.value) return undefined;
        if (!currentCategory.value) {
            return getDefaultStatusOptions();
        }
        return currentCategory.value.status_options;
    });

    return { categoryStatusOptions, getDefaultStatusOptions };
};
