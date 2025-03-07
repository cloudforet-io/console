import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';

export const useCategoriesQuery = () => {
    const { taskCategoryAPI, taskCategoryListQueryKey } = useTaskCategoryApi();
    const { data: categories, isLoading, refetch } = useQuery({
        queryKey: computed<QueryKey>(() => taskCategoryListQueryKey.value),
        queryFn: async () => {
            const { results } = await taskCategoryAPI.list({});
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
