import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

const basePieWidgetConfig: WidgetConfig = {
    widget_config_id: 'basePie',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/base-widgets/base-pie/BasePieWidget.vue'),
    }),
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['sm', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        cost_data_field: COST_DATA_FIELD_MAP.PROVIDER.name,
        chart_type: CHART_TYPE.PIE,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
};

export default basePieWidgetConfig;
