import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptions,
    getWidgetInheritOptionsForFilter,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const countOfPassAndFailFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'countOfPassAndFailFindings',
    base_configs: [{ config_id: 'baseCountOfFindings' }],
    title: 'Count of Pass and Fail Findings',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COUNT_OF_PASS_AND_FAIL_FINDINGS.DESC',
        preview_image: 'widget-img_countOfPassAndFailFindings--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.YEARLY,
        asset_group_by: ASSET_GROUP_BY.REGION,
        pagination_options: {
            enabled: true,
            page_size: 8,
        },
    },
    inherit_options: {
        ...getWidgetInheritOptions('asset_query_set'),
        ...getWidgetInheritOptionsForFilter(
            'provider',
            'project',
            'region',
            'asset_compliance_framework',
            'asset_account',
        ),
    },
    options_schema: {
        default_properties: ['asset_query_set', 'asset_group_by', ...getWidgetFilterSchemaPropertyNames(
            'provider',
            'project',
            'region',
            'asset_compliance_framework',
            'asset_account',
        )],
        fixed_properties: ['asset_query_set', 'asset_group_by'],
        non_inheritable_properties: ['asset_group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('asset_query_set', 'asset_group_by'),
                ...getWidgetFilterOptionsSchema(
                    'project',
                    // 'service_account', HACK: Re-enable it after backend is ready
                    'provider',
                    'region',
                    'asset_compliance_framework',
                    'asset_account',
                ),
            },
            order: ['asset_query_set', 'asset_group_by', ...getWidgetFilterSchemaPropertyNames(
                'project',
                // 'service_account',
                'provider',
                'region',
                'asset_compliance_framework',
                'asset_account',
            )],
        },
    },
};

export default countOfPassAndFailFindingsWidgetConfig;
