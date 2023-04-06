import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


const awsDataTransferCostTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferCostTrend',
    title: 'AWS Data-Transfer Cost Trend',
    labels: ['Cost'],
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-data-transfer-cost-trend/AWSDataTransferCostTrendWidget.vue'),
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
        group_by: GROUP_BY.TYPE,
        legend_options: {
            enabled: true,
            show_at: 'chart',
        },
        selector_options: {
            enabled: true,
            type: 'cost-usage',
        },
    },
    options_schema: {
        default_properties: ['group_by', ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'region')],
        fixed_properties: ['group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('group_by'),
                ...getWidgetFilterOptionsSchema('project', 'service_account', 'project_group', 'region', 'account'),
            },
            order: ['group_by', ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'project_group', 'region', 'account')],
        },
    },
};

export default awsDataTransferCostTrendWidgetConfig;
