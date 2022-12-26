import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const costDonutWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costDonut',
    title: 'Cost Donut',
    labels: ['Cost'],
    base_configs: [{ config_id: 'dashboardCommon' }, { config_id: 'basePie' }],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_DONUT.DESC',
        preview_image: 'widget-img_costDonut--thumbnail.png',
    },
    options: {
        chart_type: 'DONUT',
    },
};

export default costDonutWidgetConfig;
