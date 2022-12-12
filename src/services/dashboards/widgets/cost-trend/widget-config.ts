import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { CHART_TYPE, GROUP_BY } from '@/services/dashboards/widgets/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';

const costTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'costTrend',
    base_configs: [{ config_id: 'baseTrend' }],
    title: 'Cost Trend',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_TREND.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    widget_options: {
        granularity: 'MONTHLY',
        chart_type: CHART_TYPE.LINE,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
    },
    widget_options_schema: {
        type: 'object',
        properties: {
            group_by: {
                title: 'Group By',
                type: 'string',
                enum: Object.values(GROUP_BY),
                menuItems: Object.values(GROUP_BY_ITEM_MAP),
                default: GROUP_BY.PROVIDER,
            },
        },
        required: ['group_by'],
    },
};

export default costTrendWidgetConfig;
