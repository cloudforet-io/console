import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useCategoryQuery = ({ categoryId }: {
  categoryId: Ref<string | undefined>;
}) => {
    const { taskCategoryAPI } = useTaskCategoryApi();
    const { key: taskCategoryQueryKey, params: taskCategoryParams } = useServiceQueryKey('opsflow', 'task-category', 'get', {
        contextKey: categoryId,
        params: computed(() => ({ category_id: categoryId.value as string })),
    });
    const { data, isLoading, error } = useQuery({
        queryKey: taskCategoryQueryKey,
        queryFn: () => taskCategoryAPI.get(taskCategoryParams.value),
        enabled: computed(() => !!categoryId.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });

    return { data, isLoading, error };
};
