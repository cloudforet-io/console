import type { Ref } from 'vue';
import { computed } from 'vue';

import { useCategoriesQuery } from './use-categories-query';

export const useCurrentCategory = ({ categoryId }: {
  categoryId: Ref<string | undefined>;
}) => {
    const { categories, isLoading } = useCategoriesQuery();

    const currentCategory = computed(() => categories.value?.find((c) => c.category_id === categoryId?.value));

    return { currentCategory, isLoading };
};
