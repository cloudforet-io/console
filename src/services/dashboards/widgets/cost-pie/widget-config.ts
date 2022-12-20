import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';

const costPieWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costPie',
    title: 'Cost Pie',
    base_configs: [{ config_id: 'dashboardCommon' }, { config_id: 'basePie' }],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_PIE.DESC',
        preview_image: 'widget-img_costPie--thumbnail.png',
    },
    widget_options: {
        chart_type: 'PIE',
    },
    widget_options_schema: {
        default_properties: ['group_by'],
        schema: {
            type: 'object',
            properties: {
                group_by: {
                    title: 'Group By',
                    type: 'string',
                    enum: Object.values(GROUP_BY),
                    menuItems: Object.values(GROUP_BY_ITEM_MAP),
                },
            },
            required: ['group_by'],
        },
    },
};

export default costPieWidgetConfig;
