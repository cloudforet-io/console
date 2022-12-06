import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';

const baseTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseTrend',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/_base/base-trend/BaseTrendWidget.vue'),
    }),
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BASE_TREND.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    widget_options: {
        granularity: 'MONTHLY',
        group_by: GROUP_BY.PROVIDER,
    },
    widget_options_schema: {
        type: 'object',
        properties: {
            group_by: {
                type: 'string',
                enum: Object.values(GROUP_BY),
            },
        },
        required: ['group_by'],
    },
};

export default baseTrendWidgetConfig;
