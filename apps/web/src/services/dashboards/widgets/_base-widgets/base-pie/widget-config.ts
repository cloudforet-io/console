import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

const basePieWidgetConfig: WidgetConfig = {
    widget_config_id: 'basePie',
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
