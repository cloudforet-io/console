import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const awsCloudFrontCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'costSummaryMultiFields',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/cost-summary-multi-fields/CostSummaryMultiFieldsWidget.vue'),
    }),
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
        'cost_data_source',
        ['cost_data_field', { name: 'Row Field' }],
        ['cost_secondary_data_field', { name: 'Column Field' }],
        'cost_data_type',
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

export default awsCloudFrontCostWidgetConfig;
