import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';

export const useCategoryQuery = ({ categoryId }: {
  categoryId: Ref<string | undefined>;
}) => {
    const { taskCategoryAPI, taskCategoryQueryKey } = useTaskCategoryApi();
    const { data, isLoading, error } = useQuery({
        queryKey: computed(() => [
            ...taskCategoryQueryKey.value,
            categoryId.value,
        ]),
        queryFn: () => taskCategoryAPI.get({ category_id: categoryId.value as string }),
        enabled: computed(() => !!categoryId.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });

    return { data, isLoading, error };
};
