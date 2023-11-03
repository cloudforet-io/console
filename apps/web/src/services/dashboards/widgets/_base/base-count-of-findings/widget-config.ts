import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_DATA_FIELD_MAP, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';

const baseCountOfFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseCountOfFindings',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/_base/base-count-of-findings/BaseCountOfFindingsWidget.vue'),
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
