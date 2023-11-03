import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';

const basePieWidgetConfig: WidgetConfig = {
    widget_config_id: 'basePie',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/_base/base-pie/BasePieWidget.vue'),
    }),
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['sm', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        cost_data_field: COST_DATA_FIELD_MAP.PROVIDER.name,
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
