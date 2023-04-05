import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema, getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const costDonutWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costDonut',
    title: 'Cost Donut',
    labels: ['Cost'],
    base_configs: [{ config_id: 'basePie' }],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_DONUT.DESC',
        preview_image: 'widget-img_costDonut--thumbnail.png',
    },
    options: {
        chart_type: CHART_TYPE.DONUT,
    },
    options_schema: {
        default_properties: ['group_by', ...getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account', 'region')],
        fixed_properties: ['group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('group_by'),
                ...getWidgetFilterOptionsSchema(
                    'provider',
                    'project',
                    'service_account',
                    'project_group',
                    'category',
                    'resource_group',
                    'product',
                    'region',
                    'usage_type',
                    'account',
                ),
            },
            order: ['group_by', ...getWidgetFilterSchemaPropertyNames(
                'provider',
                'project',
                'service_account',
                'project_group',
                'category',
                'resource_group',
                'product',
                'region',
                'usage_type',
                'account',
            )],
        },
    },
};

export default costDonutWidgetConfig;
