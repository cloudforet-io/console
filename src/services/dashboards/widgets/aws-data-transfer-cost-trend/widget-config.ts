import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { CHART_TYPE, GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/config';

const awsDataTransferCostTrendWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferCostTrend',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-data-transfer-cost-trend/AWSDataTransferCostTrend.vue'),
    }),
    title: 'AWS Data-Transfer Cost Trend',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_DATA_TRANSFER_COST_TREND.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 3,
    },
    sizes: ['lg', 'full'],
    widget_options: {
        chart_type: CHART_TYPE.STACKED_COLUMN,
        granularity: GRANULARITY.ACCUMULATED,
        group_by: GROUP_BY.PROJECT,
        legend_options: {
            enabled: true,
            show_at: 'chart',
        },
        selector_options: {
            enabled: true,
            type: 'cost-usage',
        },
    },
};

export default awsDataTransferCostTrendWidgetConfig;
