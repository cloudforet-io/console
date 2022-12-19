import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const costPieWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costPie',
    title: 'Cost Pie',
    base_configs: [{ config_id: 'basePie' }],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_PIE.DESC',
        preview_image: 'widget-img_costPie--thumbnail.png',
    },
    widget_options: {
        chart_type: 'PIE',
    },
};

export default costPieWidgetConfig;
