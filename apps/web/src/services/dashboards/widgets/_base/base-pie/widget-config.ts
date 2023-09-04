import { defineAsyncComponent } from 'vue';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const basePieWidgetConfig: WidgetConfig = {
    widget_config_id: 'basePie',
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/_base/base-pie/BasePieWidget.vue')),
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['sm', 'full'],
    options: {
        granularity: GRANULARITY.ACCUMULATED,
        cost_group_by: COST_GROUP_BY.PROVIDER,
        chart_type: CHART_TYPE.PIE,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
};

export default basePieWidgetConfig;
