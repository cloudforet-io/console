import { ASSET_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

const countOfFailFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'countOfFailFindings',
    base_configs: [{ config_id: 'baseCountOfFindings' }],
    title: 'Count of Fail Findings',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COUNT_OF_FAIL_FINDINGS.DESC',
        preview_image: 'widget-img_countOfFailFindings--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.YEARLY,
        asset_data_field: ASSET_DATA_FIELD_MAP.SERVICE.name,
        pagination_options: {
            enabled: true,
            page_size: 8,
        },
    },
    options_schema: getWidgetOptionsSchema([
        ['cloud_service_query_set', { fixed: true, hidden: true }],
        ['asset_data_field', { fixed: true }],
        ['filters.project_group', { fixed: true }],
        ['filters.project', { fixed: true }],
        // 'filters.service_account', HACK: Re-enable it after backend is ready
        ['filters.region', { fixed: true }],
        'filters.provider',
        // 'filters.asset_account',
    ]),
};

export default countOfFailFindingsWidgetConfig;
