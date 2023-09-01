import type { UnwrapRef } from 'vue';
import { computed, ref } from 'vue';

import type { WidgetBaseState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-base-state';

export const useWidgetPagination = (baseState: UnwrapRef<WidgetBaseState>) => {
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
