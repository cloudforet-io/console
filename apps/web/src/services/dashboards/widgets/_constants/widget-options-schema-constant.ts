import type {
    WidgetFilterOptionKey, WidgetOptionKey,
    WidgetOptionsSchemaProperty,
} from '@/schema/dashboard/_types/widget-type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';


// HACK: Modeling it like any other option thereafter
export const COST_VALUE_WIDGET_OPTION_CONFIGS = {
    cost_tag_value: {
        key: 'cost_tag_value',
        name: 'Cost Tag',
    },
    cost_additional_info_value: {
        key: 'cost_additional_info_value',
        name: 'Cost Additional Info',
    },
} as const;

export const WIDGET_FILTERS_SCHEMA_PROPERTIES: Record<WidgetFilterOptionKey, WidgetOptionsSchemaProperty> = {
    'filters.workspace': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.key },
        ],
    },
    'filters.provider': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.provider.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.provider.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.provider.key },
        ],
    },
    'filters.project': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.project.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.project.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project.key },
        ],
    },
    'filters.service_account': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key },
        ],
    },
    'filters.region': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.region.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.region.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.region.key },
        ],
    },
    'filters.cost_product': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key },
        ],
    },
    'filters.cost_tag_value': {
        key: COST_VALUE_WIDGET_OPTION_CONFIGS.cost_tag_value.key,
        name: COST_VALUE_WIDGET_OPTION_CONFIGS.cost_tag_value.name,
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_tag_key.key },
        ],
    },
    'filters.cost_additional_info_value': {
        key: COST_VALUE_WIDGET_OPTION_CONFIGS.cost_additional_info_value.key,
        name: COST_VALUE_WIDGET_OPTION_CONFIGS.cost_additional_info_value.name,
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_additional_info_key.key },
        ],
    },
    'filters.cost_usage_type': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.name,
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.key },
        ],
    },
    'filters.asset_account': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key },
        ],
    },
};

export const WIDGET_OPTIONS_SCHEMA_PROPERTIES: Omit<Record<WidgetOptionKey, WidgetOptionsSchemaProperty>, WidgetFilterOptionKey> = {
    granularity: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.granularity.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.granularity.name,
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.granularity.key },
        ],
    },
    cost_data_source: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.name,
        selection_type: 'SINGLE',
        inheritance_mode: 'KEY_MATCHING',
        fixed: true,
        scope: 'GLOBAL',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key },
        ],
    },
    cost_data_type: {
        key: 'cost_data_type',
        name: 'Data Type',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_default_data_type.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_key.key },
        ],
    },
    cost_data_field: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_default_field.key,
        name: 'Data Field (Cost)',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_default_field.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_additional_info_key.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_tag_key.key },
        ],
    },
    cost_secondary_data_field: {
        key: 'cost_secondary_data_field',
        name: 'Data Field (Cost)',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_default_field.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_additional_info_key.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_tag_key.key },
        ],
    },
    cloud_service_query_set: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key,
        name: 'Compliance Framework',
        selection_type: 'SINGLE',
        inheritance_mode: 'KEY_MATCHING',
        fixed: true,
        scope: 'GLOBAL',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key },
        ],
    },
    //
    asset_data_type: {
        key: 'asset_data_type',
        name: 'Data Type',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_data_key.key },
        ],
    },
    asset_data_field: {
        key: 'asset_data_field',
        name: 'Data Field (Asset)',
        selection_type: 'SINGLE',
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_default_field.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_additional_info_key.key },
        ],
    },
    asset_secondary_data_field: {
        key: 'asset_secondary_data_field',
        name: 'Data Field (Asset)',
        selection_type: 'SINGLE',
        readonly: true,
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_default_field.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_additional_info_key.key },
        ],
    },
};

