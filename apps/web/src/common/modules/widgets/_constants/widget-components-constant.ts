import type { AsyncComponent } from 'vue';

import type { NewWidgetConfigKey } from '@/common/modules/widgets/types/widget-list-type';


export const WIDGET_COMPONENTS: Record<NewWidgetConfigKey, AsyncComponent> = {
    stackedColumnChart: () => ({
        component: import('@/common/modules/widgets/_base-widgets/stacked-column-chart/StackedColumnChart.vue'),
    }),
};
