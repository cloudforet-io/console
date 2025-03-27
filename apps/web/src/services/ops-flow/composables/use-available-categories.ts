import { computed, type Ref } from 'vue';

import { useCategoriesQuery } from '@/services/ops-flow/composables/use-categories-query';

export const useAvailableCategories = (ops?: {
  enabled?: Ref<boolean>;
}) => {
    const { categories, isLoading, refetch } = useCategoriesQuery(ops);
    const availableCategories = computed(() => categories.value?.filter((c) => c.state !== 'DELETED'));
    return {
        availableCategories, isLoading, refetch,
    };
};
