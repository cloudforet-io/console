import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';
import { excludePropertiesFromDashboardCommonWidgetConfig } from '@/services/dashboards/widgets/widget-options-schema-helper';

const {
    default_properties,
    inheritable_properties,
    schema,
} = excludePropertiesFromDashboardCommonWidgetConfig(['filters.provider']);

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
        default_properties,
        inheritable_properties,
        schema: {
            type: 'object',
            properties: {
                group_by: {
                    title: 'Group By',
                    type: 'string',
                    enum: Object.values(GROUP_BY),
                    menuItems: Object.values(GROUP_BY_ITEM_MAP),
                },
                ...schema.properties,
            },
            required: ['group_by'],
        },
    },
};

export default awsCloudFrontCostWidgetConfig;
