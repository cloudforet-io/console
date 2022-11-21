import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const costPieWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costPie',
    title: 'Cost Pie',
    base_configs: [{ config_id: 'basePie' }],
    widget_options: {
        chart_type: 'PIE',
    },
};

export default costPieWidgetConfig;
