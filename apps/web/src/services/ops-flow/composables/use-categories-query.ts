
import { computed, type Ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useCategoriesQuery = (ops?: {
  enabled?: Ref<boolean>;
}) => {
    const { enabled } = ops ?? {};
    const { taskCategoryAPI } = useTaskCategoryApi();
    const { key: taskCategoryListQueryKey, params: taskCategoryListParams } = useServiceQueryKey('opsflow', 'task-category', 'list', {
        params: computed(() => ({ include_deleted: true })),
    });
    const {
        data: categories, isLoading, refetch, error,
    } = useQuery({
        queryKey: taskCategoryListQueryKey,
        queryFn: async () => {
            const { results } = await taskCategoryAPI.list(taskCategoryListParams.value);
            return results ?? [];
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });
    return {
        categories,
        isLoading,
        refetch,
        error,
    };
};
