import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

const costSummaryMultiFieldsWidgetConfig: WidgetConfig = {
    widget_config_id: 'costSummaryMultiFields',
    title: 'Cost & Usage Trend (Bar Chart)',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_SUMMARY_MULTI_FIELDS.DESC',
        preview_image: 'widget-img_awsCloudFrontCost--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    options: {
        cost_data_type: 'cost',
        chart_type: CHART_TYPE.STACKED_COLUMN,
        granularity: GRANULARITY.YEARLY,
        cost_data_field: COST_DATA_FIELD_MAP.PROJECT.name,
        cost_secondary_data_field: COST_DATA_FIELD_MAP.PRODUCT.name,
        legend_options: {
            enabled: true,
            show_at: 'chart',
        },
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
    options_schema: getWidgetOptionsSchema([
        ['cost_data_source', { fixed: true, hidden: true }],
        ['cost_data_field', { name: 'Row Field', fixed: true }],
        ['cost_secondary_data_field', { name: 'Column Field', fixed: true }],
        ['cost_data_type', { fixed: true }],
        ['granularity', { fixed: true, readonly: true }],
        ['filters.cost_product', { fixed: true }],
        ['filters.project_group', { fixed: true }],
        ['filters.project', { fixed: true }],
        ['filters.service_account', { fixed: true }],
        ['filters.region', { fixed: true }],
        'filters.provider',
        'filters.cost_usage_type',
        'filters.cost_additional_info_value',
        'filters.cost_tag_value',
    ]),
};

export default costSummaryMultiFieldsWidgetConfig;
