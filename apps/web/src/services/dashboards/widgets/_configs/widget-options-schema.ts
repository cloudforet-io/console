import type { VariableModelConfig } from '@/lib/variable-models';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import { ASSET_GROUP_BY_ITEM_MAP, COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
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

export const WIDGET_FILTERS_SCHEMA_PROPERTIES: Record<string, WidgetOptionsSchemaProperty> = {
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
    [MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key]: {
        key: getWidgetFilterKey(MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key),
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key },
        ],
    },
};

export const WIDGET_OPTIONS_SCHEMA_PROPERTIES: Record<string, WidgetOptionsSchemaProperty> = {
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
    cost_data_type: {
        key: 'cost_data_type',
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
    [MANAGED_VARIABLE_MODEL_CONFIGS.cost_default_field.key]: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_default_field.key,
        name: 'Group by (Cost)',
        selection_type: 'MULTI',
        required: true,
        fixed: true,
        item_options: [
            { type: 'ENUM', values: Object.entries(COST_GROUP_BY_ITEM_MAP).map(([key, { name }]) => ({ key, name })) },
        ],
    },
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
    asset_default_field: {
        key: 'asset_default_field',
        name: 'Group by (Asset)',
        selection_type: 'MULTI',
        required: true,
        fixed: true,
        item_options: [
            { type: 'ENUM', values: Object.entries(ASSET_GROUP_BY_ITEM_MAP).map(([key, { name }]) => ({ key, name })) },
        ],
    },
    [MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key]: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key,
        name: 'Compliance Framework',
        selection_type: 'MULTI',
        required: true,
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key },
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


