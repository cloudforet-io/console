import type {
    WidgetFilterOptionKey, WidgetOptionKey,
    WidgetOptionsSchemaProperty,
} from '@/api-clients/dashboard/_types/widget-type';

import { MANAGED_VARIABLE_MODEL_KEY_MAP } from '@/lib/variable-models/managed-model-config/base-managed-model-config';


// HACK: Modeling it like any other option thereafter
export const COST_VALUE_WIDGET_OPTION_CONFIGS = {
    cost_tag_value: {
        key: 'cost_tag_value',
    },
    cost_additional_info_value: {
        key: 'cost_additional_info_value',
    },
} as const;

export const MANAGED_WIDGET_FILTERS_SCHEMA_PROPERTIES: Record<WidgetFilterOptionKey, WidgetOptionsSchemaProperty> = {
    // 'filters.workspace': {
    //     key: MANAGED_VARIABLE_MODEL_KEY_MAP.workspace,
    //     name: 'Workspace',
    //     selection_type: 'MULTI',
    //     inheritance_mode: 'KEY_MATCHING',
    //     fixed: true,
    //     item_options: [
    //         { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.workspace },
    //     ],
    // },
    'filters.provider': {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.provider,
        name: 'Provider',
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.provider },
        ],
    },
    'filters.project_group': {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.project_group,
        name: 'Project Group',
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.project_group },
        ],
    },
    'filters.project': {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.project,
        name: 'Project',
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.project },
        ],
    },
    'filters.service_account': {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.service_account,
        name: 'Service Account',
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.service_account },
        ],
    },
    'filters.region': {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.region,
        name: 'Region',
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.region },
        ],
    },
    'filters.cost_product': {
        key: 'cost_product',
        name: 'Product (Cost)',
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'product' },
        ],
    },
    'filters.cost_tag_value': {
        key: COST_VALUE_WIDGET_OPTION_CONFIGS.cost_tag_value.key,
        name: 'Cost Tag',
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_tag_key },
        ],
    },
    'filters.cost_additional_info_value': {
        key: COST_VALUE_WIDGET_OPTION_CONFIGS.cost_additional_info_value.key,
        name: 'Cost Additional Info',
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_additional_info_key },
        ],
    },
    'filters.cost_usage_type': {
        key: 'cost_usage_type',
        name: 'Usage Type (Cost)',
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'usage_type' },
        ],
    },
    'filters.asset_account': {
        key: 'asset_account',
        name: 'AWS Account ID (Asset)',
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service, dataKey: 'account' },
        ],
    },
};

export const MANAGED_WIDGET_OPTIONS_SCHEMA_PROPERTIES: Omit<Record<WidgetOptionKey, WidgetOptionsSchemaProperty>, WidgetFilterOptionKey> = {
    granularity: {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.granularity,
        name: 'Granularity',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.granularity },
        ],
    },
    cost_data_source: {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_data_source,
        name: 'Data Source',
        selection_type: 'SINGLE',
        inheritance_mode: 'KEY_MATCHING',
        scope: 'GLOBAL',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_data_source },
        ],
    },
    cost_data_type: {
        key: 'cost_data_type',
        name: 'Data Type',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_default_data_type },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_data_key },
        ],
    },
    cost_data_field: {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_default_field,
        name: 'Data Field (Cost)',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_default_field },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_additional_info_key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_tag_key },
        ],
    },
    cost_secondary_data_field: {
        key: 'cost_secondary_data_field',
        name: 'Data Field (Cost)',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_default_field },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_additional_info_key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_tag_key },
        ],
    },
    cloud_service_query_set: {
        key: MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service_query_set,
        name: 'Compliance Framework',
        selection_type: 'SINGLE',
        inheritance_mode: 'KEY_MATCHING',
        scope: 'GLOBAL',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service_query_set },
        ],
    },
    //
    asset_data_type: {
        key: 'asset_data_type',
        name: 'Data Type',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.asset_data_key },
        ],
    },
    asset_data_field: {
        key: 'asset_data_field',
        name: 'Data Field (Asset)',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.asset_default_field },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.asset_additional_info_key },
        ],
    },
    asset_secondary_data_field: {
        key: 'asset_secondary_data_field',
        name: 'Data Field (Asset)',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.asset_default_field },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_KEY_MAP.asset_additional_info_key },
        ],
    },
};

