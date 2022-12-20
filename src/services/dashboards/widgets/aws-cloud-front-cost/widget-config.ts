import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';

const awsCloudFrontCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsCloudFrontCost',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-cloud-front-cost/AWSCloudFrontCost.vue'),
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
    widget_options_schema: {
        default_properties: ['group_by', 'filters.project_id', 'filters.service_account_id'],
        inheritable_properties: [
            'filters.project_id',
            'filters.service_account_id',
            'filters.user_id',
            'filters.cloud_service_type_id',
            'filters.region_code',
        ],
        schema: {
            type: 'object',
            properties: {
                group_by: {
                    title: 'Group By',
                    type: 'string',
                    enum: Object.values(GROUP_BY),
                    menuItems: Object.values(GROUP_BY_ITEM_MAP),
                },
                'filters.project_id': {
                    title: 'Project',
                    type: 'array',
                },
                'filters.service_account_id': {
                    title: 'Service Account',
                    type: 'array',
                },
                'filters.user_id': {
                    title: 'User',
                    type: 'array',
                },
                'filters.cloud_service_type_id': {
                    title: 'Cloud Service Type',
                    type: 'array',
                },
                'filters.region_code': {
                    title: 'Region',
                    type: 'array',
                },
            },
            required: ['group_by'],
        },
    },
};

export default awsCloudFrontCostWidgetConfig;
