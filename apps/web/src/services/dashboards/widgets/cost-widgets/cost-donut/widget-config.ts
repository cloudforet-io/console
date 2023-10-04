import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetInheritOptions,
    getWidgetInheritOptionsForFilter,
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
    inherit_options: {
        ...getWidgetInheritOptions('cost_data_source'),
        ...getWidgetInheritOptionsForFilter(
            'provider',
            'project',
            'service_account',
            'region',
            'cost_product',
        ),
    },
    options_schema: {
        default_properties: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames(
            'provider',
            'project',
            'service_account',
            'region',
            'cost_product',
        )],
        fixed_properties: ['cost_data_source', 'cost_group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_data_source', 'cost_group_by'),
                ...getWidgetFilterOptionsSchema(
                    'provider',
                    'project',
                    'service_account',
                    'project_group',
                    'cost_product',
                    'region',
                    'cost_usage_type',
                ),
            },
            order: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames(
                'provider',
                'project',
                'service_account',
                'project_group',
                'cost_product',
                'region',
                'cost_usage_type',
            )],
        },
    },
};

export default costDonutWidgetConfig;
