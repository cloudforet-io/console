import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const costTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'costTrend',
    base_configs: [{ config_id: 'baseTrend' }],
    labels: ['Cost'],
    description: {
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
};

export default costTrendWidgetConfig;
