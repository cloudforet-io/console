import type { UnwrapRef } from 'vue';
import { computed, ref } from 'vue';

import type { MergedWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-merged-widget-state';

export const useWidgetPagination = (baseState: UnwrapRef<MergedWidgetState>) => {
    const thisPage = ref(1);
    const pageSize = computed(() => {
        if (baseState.options?.pagination_options?.enabled) return baseState.options.pagination_options.page_size;
        return undefined;
    });

    return {
        thisPage,
        pageSize,
    };
};
