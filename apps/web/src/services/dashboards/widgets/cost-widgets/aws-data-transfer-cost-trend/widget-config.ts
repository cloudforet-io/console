import { defineAsyncComponent } from 'vue';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const awsDataTransferCostTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferCostTrend',
    title: 'AWS Data-Transfer Cost Trend',
    labels: ['Cost'],
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/cost-widgets/aws-data-transfer-cost-trend/AWSDataTransferCostTrendWidget.vue')),
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
        cost_group_by: COST_GROUP_BY.TYPE,
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
        default_properties: ['cost_group_by', ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'region', 'cost_account')],
        fixed_properties: ['cost_group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_group_by'),
                ...getWidgetFilterOptionsSchema('project', 'service_account', 'project_group', 'region', 'cost_account'),
            },
            order: ['cost_group_by', ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'project_group', 'region', 'cost_account')],
        },
    },
};

export default awsDataTransferCostTrendWidgetConfig;
