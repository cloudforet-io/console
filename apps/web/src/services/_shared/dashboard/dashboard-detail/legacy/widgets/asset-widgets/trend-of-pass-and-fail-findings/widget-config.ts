import { ASSET_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

const trendOfPassAndFailFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'trendOfPassAndFailFindings',
    title: 'Trend of Pass and Fail Findings',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.TREND_OF_PASS_AND_FAIL_FINDINGS.DESC',
        preview_image: 'widget-img_trendOfPassAndFailFindings--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        asset_data_field: ASSET_DATA_FIELD_MAP.SERVICE.name,
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
    options_schema: getWidgetOptionsSchema([
        ['cloud_service_query_set', { fixed: true }],
        'asset_data_field',
        'filters.project_group',
        'filters.project',
        'filters.provider',
        'filters.region',
        'filters.asset_account',
    ]),
};

export default trendOfPassAndFailFindingsWidgetConfig;
