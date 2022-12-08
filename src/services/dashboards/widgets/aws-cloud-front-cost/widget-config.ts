import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';

const awsCloudFrontCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferCostTrend',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-cloud-front-cost/AWSCloudFrontCost.vue'),
    }),
    title: 'AWS CloudFront Cost',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_CLOUD_FRONT_COST.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 3,
    },
    sizes: ['lg', 'full'],
    widget_options: {
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

export default awsCloudFrontCostWidgetConfig;
