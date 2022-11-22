import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const costDonutWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costDonut',
    title: 'Cost Donut',
    base_configs: [{ config_id: 'basePie' }],
    widget_options: {
        chart_type: 'DONUT',
    },
};

export default costDonutWidgetConfig;
