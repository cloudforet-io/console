import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema, getWidgetFilterSchemaPropertyNames, getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const trendOfPassAndFailFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'trendOfPassAndFailFindings',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/trend-of-pass-and-fail-findings/TrendOfPassAndFailFindingsWidget.vue'),
    }),
    title: 'Trend of Pass and Fail Findings',
    labels: ['Asset'],
    description: {
        // translation_id: 'DASHBOARDS.WIDGET.MONTHLY_COST.DESC',
        // preview_image: 'widget-img_monthlyCost--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        asset_group_by: ASSET_GROUP_BY.SERVICE,
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
    options_schema: {
        default_properties: ['asset_group_by', ...getWidgetFilterSchemaPropertyNames('project', 'service_account', 'provider', 'asset_compliance_type', 'region', 'asset_account')],
        fixed_properties: ['asset_group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('asset_group_by'),
                ...getWidgetFilterOptionsSchema(
                    'project',
                    'service_account',
                    'provider',
                    'asset_compliance_type',
                    'region',
                    'asset_account',
                ),
            },
            order: ['asset_group_by', ...getWidgetFilterSchemaPropertyNames(
                'project',
                'service_account',
                'provider',
                'asset_compliance_type',
                'region',
                'asset_account',
            )],
        },
    },
};

export default trendOfPassAndFailFindingsWidgetConfig;
