import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_DATA_FIELD_MAP, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

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
        'cloud_service_query_set',
        'asset_data_field',
        'filters.project',
        // 'filters.service_account', HACK: Re-enable it after backend is ready
        'filters.provider',
        'filters.region',
        'filters.asset_account',
    ]),
};

export default countOfFailFindingsWidgetConfig;
