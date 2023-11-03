import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { COST_DATA_FIELD_MAP } from '@/services/dashboards/widgets/_configs/config';

const baseTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseTrend',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/_base/base-trend/BaseTrendWidget.vue'),
    }),
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: 'MONTHLY',
        cost_data_field: COST_DATA_FIELD_MAP.PROVIDER.name,
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
};

export default baseTrendWidgetConfig;
