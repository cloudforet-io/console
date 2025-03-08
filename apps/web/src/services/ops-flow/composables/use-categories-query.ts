
import { useQuery } from '@tanstack/vue-query';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';

export const useCategoriesQuery = () => {
    const { taskCategoryAPI, taskCategoryListQueryKey } = useTaskCategoryApi();
    const { data: categories, isLoading, refetch } = useQuery({
        queryKey: taskCategoryListQueryKey,
        queryFn: async () => {
            const { results } = await taskCategoryAPI.list({ include_deleted: true });
            return results ?? [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });
    return {
        categories,
        isLoading,
        refetch,
    };
};
