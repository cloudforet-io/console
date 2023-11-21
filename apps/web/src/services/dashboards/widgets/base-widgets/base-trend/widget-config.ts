import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';

const baseTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseTrend',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/base-widgets/base-trend/BaseTrendWidget.vue'),
    }),
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
};

export default baseTrendWidgetConfig;
