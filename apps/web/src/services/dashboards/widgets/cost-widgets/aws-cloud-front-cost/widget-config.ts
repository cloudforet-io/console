import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { COST_REFERENCE_SCHEMA } from '@/services/dashboards/widgets/_configs/widget-schema-config';
import {
    getWidgetFilterOptionsSchema, getWidgetFilterSchemaPropertyName, getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


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
    },
    options_schema: {
        default_properties: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames('cost_product', 'project', 'service_account', 'region', 'cost_account')],
        fixed_properties: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames('cost_product')],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_data_source', 'cost_group_by'),
                [getWidgetFilterSchemaPropertyName('cost_product')]: {
                    ...COST_REFERENCE_SCHEMA.cost_product,
                    default: ['AmazonCloudFront'],
                },
                ...getWidgetFilterOptionsSchema('project', 'service_account', 'project_group', 'region', 'cost_account'),
            },
            order: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames('cost_product', 'project', 'service_account', 'project_group', 'region', 'cost_account')],
        },
    },
};

export default awsCloudFrontCostWidgetConfig;
