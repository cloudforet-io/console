import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-options-schema-generator';

const costByRegionMultiFieldsWidgetConfig: WidgetConfig = {
    widget_config_id: 'costByRegionMultiFields',
    title: 'Cost & Usage Trend By Region',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_BY_REGION_MULTI_FIELDS.DESC',
        preview_image: 'widget-img_awsDataTransferByRegion--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    options: {
        cost_data_type: 'cost',
        granularity: GRANULARITY.MONTHLY,
        cost_data_field: COST_DATA_FIELD_MAP.REGION.name,
        chart_type: CHART_TYPE.MAP,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        ['cost_data_field', { name: 'Row Field', readonly: true }],
        ['cost_secondary_data_field', { name: 'Column Field' }],
        'cost_data_type',
        ['granularity', { fixed: true, readonly: true }],
        ['filters.cost_product', { fixed: true }],
        'filters.provider',
        'filters.project',
        'filters.service_account',
        'filters.project_group',
        'filters.region',
        'filters.cost_usage_type',
        'filters.cost_additional_info_value',
        'filters.cost_tag_value',
    ]),
};

export default costByRegionMultiFieldsWidgetConfig;
