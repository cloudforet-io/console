import { ASSET_DATA_FIELD_MAP, GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

const baseCountOfFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseCountOfFindings',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/base-widgets/base-count-of-findings/BaseCountOfFindingsWidget.vue'),
    }),
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.YEARLY,
        asset_data_field: ASSET_DATA_FIELD_MAP.REGION.name,
        pagination_options: {
            enabled: true,
            page_size: 8,
        },
        data_criteria: 'realtime',
    },
};

export default baseCountOfFindingsWidgetConfig;
