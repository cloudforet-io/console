import type { VariableModelConfig } from '@/lib/variable-models';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import { getWidgetFilterKey } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

export interface WidgetOptionsSchemaProperty {
    key: string; // e.g. cost_data_source
    name: string; // e.g. Data Source
    selection_type?: 'SINGLE'|'MULTI';
    readonly?: boolean;
    fixed?: boolean;
    required?: boolean;
    non_inheritable?: boolean;
    inheritance_mode?: 'KEY_MATCHING'|'SELECTION_TYPE_MATCHING';
    item_options?: Array<VariableModelConfig>;
    dependencies?: {
        [property: string]: { // e.g. 'cost_data_source'
            reference_key: string; // e.g. 'data_source_id'
        }
    };
}
export type WidgetOptionsSchema = {
    properties: Record<string, WidgetOptionsSchemaProperty>;
    order: string[];
};

export const COMMON_WIDGET_OPTIONS_SCHEMA_PROPERTIES: Record<string, WidgetOptionsSchemaProperty> = {
    [MANAGED_VARIABLE_MODEL_CONFIGS.provider.key]: {
        key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.provider.key),
        name: MANAGED_VARIABLE_MODEL_CONFIGS.provider.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.provider.key },
        ],
    },
    [MANAGED_VARIABLE_MODEL_CONFIGS.project.key]: {
        key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.project.key),
        name: MANAGED_VARIABLE_MODEL_CONFIGS.project.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project.key },
        ],
    },
    [MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key]: {
        key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key),
        name: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key },
        ],
    },
    [MANAGED_VARIABLE_MODEL_CONFIGS.project_group.key]: {
        key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.project_group.key),
        name: MANAGED_VARIABLE_MODEL_CONFIGS.project_group.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project_group.key },
        ],
    },
    [MANAGED_VARIABLE_MODEL_CONFIGS.region.key]: {
        key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.region.key),
        name: MANAGED_VARIABLE_MODEL_CONFIGS.region.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.region.key },
        ],
    },
};
export const COST_WIDGET_OPTIONS_SCHEMA_PROPERTIES: Record<string, WidgetOptionsSchemaProperty> = {
    [MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key]: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.name,
        selection_type: 'SINGLE',
        required: true,
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key },
        ],
    },
    dost_data_type: {
        key: 'dost_data_type',
        name: 'Data Type',
        selection_type: 'SINGLE',
        required: true,
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_default_field.key },
        ],
        dependencies: {
            [MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key]: { reference_key: 'data_source_id' },
        },
    },
    [MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key]: {
        key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key),
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key },
        ],
    },
    // TODO: update
    // {
    //     key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.type),
    //     name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.name,
    //     selection_type: 'MULTI',
    //     item_options: [
    //         { type: 'SEARCH_RESOURCE', resource_type: 'cost_analysis.Cost', reference_key: COST_VARIABLE_TYPE_INFO.cost_usage_type.key },
    //     ],
    // },
};

export const ASSET_WIDGET_OPTIONS_SCHEMA_PROPERTIES: Record<string, WidgetOptionsSchemaProperty> = {
    [MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key]: {
        // TODO: add conversion code for key changing from asset_query_set to cloud_service_query_set
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.name,
        selection_type: 'SINGLE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key },
        ],
    },
    [MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key]: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key },
        ],
    },
};

