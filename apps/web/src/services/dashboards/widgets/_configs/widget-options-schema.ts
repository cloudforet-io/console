import type { VariableModelConfig } from '@/lib/variable-models';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import { ASSET_GROUP_BY_ITEM_MAP, COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';

/*
 * inheritance_mode: how to inherit widget options from dashboard variables.
 *      NONE: no inheritance
 *      KEY_MATCHING: inherit by key matching
 *      SELECTION_TYPE_MATCHING: inherit by selection type matching
 */
export type InheritanceMode = 'NONE'|'KEY_MATCHING'|'SELECTION_TYPE_MATCHING';

type WidgetOptionPropertyDependency = Partial<{
    [property in WidgetOptionKey]: { // e.g. 'cost_data_source'
        reference_key: string; // e.g. 'data_source_id'
    }
}>;
export interface WidgetOptionsSchemaProperty {
    key: string; // e.g. cost_data_source
    name?: string; // e.g. Data Source
    selection_type?: 'SINGLE'|'MULTI';
    readonly?: boolean;
    fixed?: boolean;
    optional?: boolean;
    inheritance_mode?: InheritanceMode; // default: 'KEY_MATCHING'
    item_options?: Array<VariableModelConfig>;
    dependencies?: WidgetOptionPropertyDependency;
}
export type WidgetOptionsSchema = {
    properties: Record<string, WidgetOptionsSchemaProperty>;
    order: string[];
};

export const WIDGET_FILTER_KEYS = [
    // common
    'filters.provider',
    'filters.project',
    'filters.service_account',
    'filters.project_group',
    'filters.region',
    // 'filters.cloud_service_type': 'filters.cloud_service_type',
    // 'filters.user': 'filters.user',
    // cost
    'filters.cost_product',
    'filters.cost_usage_type',
    'filters.cost_tag_value',
    'filters.cost_additional_info_value',
    // asset
    'filters.asset_account',
] as const;
export type WidgetFilterKey = typeof WIDGET_FILTER_KEYS[number];

export const WIDGET_OPTION_KEYS = [
    // cost option keys
    'cost_data_source',
    'cost_data_type',
    'cost_data_field',
    'cost_secondary_data_field',
    // asset option keys
    'cloud_service_query_set',
    'asset_data_field',
    'asset_data_type',
    'asset_secondary_data_field',
    // option filters
    ...WIDGET_FILTER_KEYS,
] as const;
export type WidgetOptionKey = typeof WIDGET_OPTION_KEYS[number];

export const WIDGET_FILTERS_SCHEMA_PROPERTIES: Record<WidgetFilterKey, WidgetOptionsSchemaProperty> = {
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
    'filters.project_group': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.project_group.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.project_group.name,
        selection_type: 'MULTI',
        inheritance_mode: 'KEY_MATCHING',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project_group.key },
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
        key: 'cost_tag_value',
        name: 'Cost Tag',
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
    },
    'filters.cost_additional_info_value': {
        key: 'cost_additional_info_value',
        name: 'Cost Additional Info',
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
    },
    'filters.cost_usage_type': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.key },
        ],
    },
    'filters.asset_account': {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.name,
        selection_type: 'MULTI',
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key },
        ],
    },
};

export const WIDGET_OPTIONS_SCHEMA_PROPERTIES: Omit<Record<WidgetOptionKey, WidgetOptionsSchemaProperty>, WidgetFilterKey> = {
    cost_data_source: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key,
        name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.name,
        selection_type: 'SINGLE',
        fixed: true,
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
        dependencies: {
            cost_data_source: { reference_key: 'data_source_id' },
        },
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
        dependencies: {
            cost_data_source: { reference_key: 'data_source_id' },
        },
    },
    cost_secondary_data_field: {
        key: 'cost_secondary_data_field',
        name: 'Data Field (Cost)',
        selection_type: 'SINGLE',
        readonly: true,
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'ENUM', values: Object.entries(COST_GROUP_BY_ITEM_MAP).map(([key, { name }]) => ({ key, name })) },
        ],
        dependencies: {
            cost_data_source: { reference_key: 'data_source_id' },
        },
    },
    cloud_service_query_set: {
        key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key,
        name: 'Compliance Framework',
        selection_type: 'SINGLE',
        fixed: true,
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
        dependencies: {
            cloud_service_query_set: { reference_key: 'query_set_id' },
        },
    },
    asset_data_field: {
        key: 'asset_data_field',
        name: 'Data Field (Asset)',
        selection_type: 'MULTI',
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_default_field.key },
            { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_additional_info_key.key },
        ],
        dependencies: {
            cloud_service_query_set: { reference_key: 'query_set_id' },
        },
    },
    asset_secondary_data_field: {
        key: 'asset_secondary_data_field',
        name: 'Data Field (Asset)',
        selection_type: 'MULTI',
        readonly: true,
        inheritance_mode: 'NONE',
        fixed: true,
        item_options: [
            { type: 'ENUM', values: Object.entries(ASSET_GROUP_BY_ITEM_MAP).map(([key, { name }]) => ({ key, name })) },
        ],
        dependencies: {
            cloud_service_query_set: { reference_key: 'query_set_id' },
        },
    },
};

type CustomOptionTuple = [WidgetOptionKey, Partial<WidgetOptionsSchemaProperty>];
export const getWidgetOptionsSchema = (options: (WidgetOptionKey|CustomOptionTuple)[]): WidgetOptionsSchema => {
    const properties = {} as Record<WidgetOptionKey, WidgetOptionsSchemaProperty>;
    const order: string[] = [];

    options.forEach((option) => {
        const optionName = typeof option === 'string' ? option : option[0];

        if (WIDGET_OPTIONS_SCHEMA_PROPERTIES[optionName]) {
            properties[optionName] = WIDGET_OPTIONS_SCHEMA_PROPERTIES[optionName] as WidgetOptionsSchemaProperty;
        } else if (WIDGET_FILTERS_SCHEMA_PROPERTIES[optionName]) {
            const filterProperty = WIDGET_FILTERS_SCHEMA_PROPERTIES[optionName];
            if (properties.cost_data_source) {
                properties[optionName] = {
                    ...filterProperty,
                    dependencies: {
                        cost_data_source: { reference_key: 'data_source_id' },
                    },
                } as WidgetOptionsSchemaProperty;
            } else {
                properties[optionName] = filterProperty as WidgetOptionsSchemaProperty;
            }
        } else {
            console.error(new Error(`No matched option schema for ${optionName}`));
        }

        if (Array.isArray(option) && option[1]) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { key: _, ...additionalProperties } = option[1];

            const defaultProperties = {
                ...properties[optionName],
                ...additionalProperties,
            };

            if (!option[1].readonly) {
                properties[optionName] = defaultProperties;
            } else {
                properties[optionName] = {
                    ...defaultProperties,
                    item_options: undefined,
                };
            }
        } else if (typeof option !== 'string') console.error(new Error(`Wrong format of argument ${option}`));

        order.push(optionName);
    });

    return { properties, order };
};


