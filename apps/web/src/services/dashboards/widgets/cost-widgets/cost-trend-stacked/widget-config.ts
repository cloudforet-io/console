import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptions, getWidgetInheritOptionsForFilter,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const costTrendStackedWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costTrendStacked',
    base_configs: [{ config_id: 'baseTrend' }],
    title: 'Cost Trend Stacked',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_TREND_STACKED.DESC',
        preview_image: 'widget-img_costTrendStacked--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    options: {
        granularity: 'MONTHLY',
        chart_type: CHART_TYPE.STACKED_COLUMN,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
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

export default costTrendStackedWidgetConfig;
