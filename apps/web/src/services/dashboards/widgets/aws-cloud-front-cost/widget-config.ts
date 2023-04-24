import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema, getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


const awsCloudFrontCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsCloudFrontCost',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-cloud-front-cost/AWSCloudFrontCostWidget.vue'),
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
        group_by: GROUP_BY.PROJECT,
        chart_type: CHART_TYPE.STACKED_COLUMN,
        granularity: GRANULARITY.ACCUMULATED,
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
        default_properties: ['group_by', ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'region', 'account')],
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

export default awsCloudFrontCostWidgetConfig;
