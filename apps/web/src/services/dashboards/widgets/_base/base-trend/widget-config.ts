import { defineAsyncComponent } from 'vue';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const baseTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseTrend',
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/_base/base-trend/BaseTrendWidget.vue')),
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: 'MONTHLY',
        cost_group_by: COST_GROUP_BY.PROVIDER,
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
};

export default baseTrendWidgetConfig;
