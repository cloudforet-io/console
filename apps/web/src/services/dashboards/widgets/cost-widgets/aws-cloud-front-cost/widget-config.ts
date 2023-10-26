import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
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
        cost_group_by: COST_GROUP_BY.PROJECT,
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
        'cost_group_by',
        'cost_product',
        'project',
        'service_account',
        'project_group',
        'region',
    ]),
    // fixed_properties: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames('cost_product')],
    // non_inheritable_properties: ['cost_group_by'],
};

export default awsCloudFrontCostWidgetConfig;
