import { ASSET_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

const baseCountOfFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseCountOfFindings',
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
