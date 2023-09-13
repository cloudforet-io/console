import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { COST_REFERENCE_SCHEMA } from '@/services/dashboards/widgets/_configs/widget-schema-config';
import {
    getWidgetFilterOptionsSchema, getWidgetFilterSchemaPropertyName,
    getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


const awsDataTransferCostTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferCostTrend',
    title: 'AWS Data-Transfer Cost Trend',
    labels: ['Cost'],
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/aws-data-transfer-cost-trend/AWSDataTransferCostTrendWidget.vue'),
    }),
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_DATA_TRANSFER_COST_TREND.DESC',
        preview_image: 'widget-img_awsDataTransferCostTrend--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 3,
    },
    sizes: ['lg', 'full'],
    options: {
        chart_type: CHART_TYPE.LINE,
        granularity: GRANULARITY.MONTHLY,
        cost_group_by: COST_GROUP_BY.USAGE_TYPE,
        legend_options: {
            enabled: true,
            show_at: 'table',
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
        default_properties: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames(
            'cost_product',
            'project',
            'service_account',
            'region',
        )],
        fixed_properties: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames('cost_product')],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_data_source', 'cost_group_by'),
                [getWidgetFilterSchemaPropertyName('cost_product')]: {
                    ...COST_REFERENCE_SCHEMA.cost_product,
                    default: ['AWSDataTransfer'],
                },
                ...getWidgetFilterOptionsSchema(
                    'project',
                    'service_account',
                    'project_group',
                    'region',
                ),
            },
            order: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames(
                'cost_product',
                'project',
                'service_account',
                'project_group',
                'region',
            )],
        },
    },
};

export default awsDataTransferCostTrendWidgetConfig;
