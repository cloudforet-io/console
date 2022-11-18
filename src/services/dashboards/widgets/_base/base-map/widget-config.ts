import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const baseMapConfig: WidgetConfig = {
    widget_config_id: 'baseMap',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/_base/base-map/BaseMapWidget.vue'),
    }),
    labels: ['Cost'],
    description: {
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['md', 'full'],
};

export default baseMapConfig;
