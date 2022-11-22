import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';

const basePieWidgetConfig: WidgetConfig = {
    widget_config_id: 'basePie',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/_base/base-pie/BasePieWidget.vue'),
    }),
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BASE_PIE.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['md', 'full'],
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

export default basePieWidgetConfig;
