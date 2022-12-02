import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { CHART_TYPE, GRANULARITY } from '@/services/dashboards/widgets/config';

const awsDataTransferByRegionWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferByRegion',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-data-transfer-by-region/AWSDataTransferByRegion.vue'),
    }),
    title: 'AWS Data-Transfer By Region',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_DATA_TRANSFER_BY_REGION.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    widget_options: {
        granularity: GRANULARITY.ACCUMULATED,
        chart_type: CHART_TYPE.MAP,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        selector_options: {
            enabled: true,
            type: 'cost-usage',
        },
    },
};

export default awsDataTransferByRegionWidgetConfig;
