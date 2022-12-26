import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';

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
    },
    options_schema: {
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

export default baseTrendWidgetConfig;
