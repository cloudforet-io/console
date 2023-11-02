import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const awsCloudFrontCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsCloudFrontCost',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/aws-cloud-front-cost/AWSCloudFrontCostWidget.vue'),
    }),
    title: 'AWS CloudFront Cost',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_CLOUD_FRONT_COST.DESC',
        preview_image: 'widget-img_awsCloudFrontCost--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 3,
    },
    sizes: ['lg', 'full'],
    options: {
        cost_data_field: MANAGED_VARIABLE_MODEL_CONFIGS.project.key,
        chart_type: CHART_TYPE.STACKED_COLUMN,
        granularity: GRANULARITY.YEARLY,
        legend_options: {
            enabled: true,
            show_at: 'chart',
        },
        selector_options: {
            enabled: true,
            type: 'cost-usage',
        },
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
        filters: {
            cost_product: [{ k: 'product', v: 'AmazonCloudFront', o: '=' }],
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
