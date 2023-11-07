import type { UnwrapRef } from 'vue';
import { computed, ref } from 'vue';

import type { MergedBaseWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/merge-base-widget-state';

export const useWidgetPagination = (mergedState: UnwrapRef<MergedBaseWidgetState>) => {
    const thisPage = ref(1);
    const pageSize = computed(() => {
        if (mergedState.options?.pagination_options?.enabled) return mergedState.options.pagination_options.page_size;
        return undefined;
    });

    return {
        thisPage,
        pageSize,
    };
};
