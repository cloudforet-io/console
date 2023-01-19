import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { excludePropertiesFromDashboardCommonWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-options-schema-helper';

const {
    default_properties,
    inheritable_properties,
    schema,
} = excludePropertiesFromDashboardCommonWidgetConfig(['filters.provider']);

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
        group_by: 'usage_type',
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
        default_properties,
        inheritable_properties,
        schema: {
            type: 'object',
            properties: {
                ...schema.properties,
            },
        },
    },
};

export default awsDataTransferCostTrendWidgetConfig;
