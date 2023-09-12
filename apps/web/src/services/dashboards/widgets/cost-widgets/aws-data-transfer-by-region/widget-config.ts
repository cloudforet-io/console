import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


const awsDataTransferByRegionWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferByRegion',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/aws-data-transfer-by-region/AWSDataTransferByRegionWidget.vue'),
    }),
    title: 'AWS Data-Transfer by Region',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_DATA_TRANSFER_BY_REGION.DESC',
        preview_image: 'widget-img_awsDataTransferByRegion--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        cost_group_by: COST_GROUP_BY.REGION,
        chart_type: CHART_TYPE.MAP,
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
        default_properties: [
            'cost_data_source',
            ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'cost_account'),
        ],
        fixed_properties: ['cost_data_source'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_data_source'),
                ...getWidgetFilterOptionsSchema('project', 'service_account', 'project_group', 'region', 'cost_account'),
            },
            order: [
                'cost_data_source',
                ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'project_group', 'region', 'cost_account'),
            ],
        },
    },
};

export default awsDataTransferByRegionWidgetConfig;
