import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type {
    WidgetFilterKey,
    WidgetFiltersSchemaProperty,
    WidgetOptionsSchemaProperty,
    InheritOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_FILTER_KEYS } from '@/services/dashboards/widgets/_configs/config';
import {
    ASSET_GROUP_BY_SCHEMA, ASSET_REFERENCE_SCHEMA,
    COST_REFERENCE_SCHEMA, COST_GROUP_BY_SCHEMA,
    RESOURCE_REFERENCE_SCHEMA, COST_DATA_SOURCE_SCHEMA,
} from '@/services/dashboards/widgets/_configs/widget-schema-config';

export const getWidgetOptionsSchema = (...optionNames: WidgetOptionsSchemaProperty[]): object => {
    const result: JsonSchema['properties'] = {};

    optionNames.forEach((optionName) => {
        if (optionName === 'cost_data_source') result.cost_data_source = COST_DATA_SOURCE_SCHEMA;
        else if (optionName === 'cost_group_by') result.cost_group_by = COST_GROUP_BY_SCHEMA;
        else if (optionName === 'asset_group_by') result.asset_group_by = ASSET_GROUP_BY_SCHEMA;
        else if (optionName.startsWith('filters.')) {
            const filterKey = optionName.replace('filters.', '');
            const filterSchema = getWidgetFilterOptionsSchema(filterKey as WidgetFilterKey);
            if (filterSchema[optionName]) result[optionName] = filterSchema[optionName];
        } else {
            console.error(`No matched option schema for ${optionName}`);
        }
    });

    return result;
};

export const getWidgetFilterOptionsSchema = (...filterKeys: WidgetFilterKey[]): object => {
    const result: JsonSchema['properties'] = {};

    filterKeys.forEach((optionName) => {
        if (RESOURCE_REFERENCE_SCHEMA[optionName]) result[`filters.${optionName}`] = RESOURCE_REFERENCE_SCHEMA[optionName];
        else if (COST_REFERENCE_SCHEMA[optionName]) result[`filters.${optionName}`] = COST_REFERENCE_SCHEMA[optionName];
        else if (ASSET_REFERENCE_SCHEMA[optionName]) result[`filters.${optionName}`] = ASSET_REFERENCE_SCHEMA[optionName];
        else console.error(`No matched filter option schema for ${optionName}`);
    });

    return result;
};


export const getWidgetFilterSchemaPropertyNames = (...keys: WidgetFilterKey[]): WidgetFiltersSchemaProperty[] => keys.map((key) => `filters.${key}` as WidgetFiltersSchemaProperty);
export const getWidgetFilterSchemaPropertyName = (key: WidgetFilterKey): WidgetFiltersSchemaProperty => `filters.${key}`;
export const getWidgetOptionName = (key: string): string => {
    if (WIDGET_FILTER_KEYS.includes(key as WidgetFilterKey)) return `filters.${key}`;
    return key;
};
export const isWidgetFilterKey = (key: string): boolean => WIDGET_FILTER_KEYS.includes(key as WidgetFilterKey);

/** @function
 * @name getWidgetOptionsSchemaPropertyName
 * @example
 * getWidgetOptionsSchemaPropertyName('filters.project_group') => 'Project Group'
 * getWidgetOptionsSchemaPropertyName('group_by') => 'Group By'
 */
export const getWidgetOptionsSchemaPropertyName = (property: WidgetOptionsSchemaProperty): string => {
    if (property.startsWith('filters.')) {
        return REFERENCE_TYPE_INFO[property.replace('filters.', '')].name;
    }
    if (property === 'group_by') return 'Group By';
    return property;
};

export const getWidgetInheritOptions = (...properties: WidgetOptionsSchemaProperty[]): InheritOptions => {
    const inheritOptions: InheritOptions = {};
    properties.forEach((propertyName) => {
        inheritOptions[propertyName] = {
            enabled: true,
            variable_info: { key: propertyName },
        };
    });
    return inheritOptions;
};
export const getWidgetInheritOptionsForFilter = (...properties: WidgetFilterKey[]): InheritOptions => {
    const inheritOptions: InheritOptions = {};
    properties.forEach((propertyName) => {
        inheritOptions[`filters.${propertyName}`] = {
            enabled: true,
            variable_info: { key: propertyName },
        };
    });
    return inheritOptions;
};

export const getNonInheritedWidgetOptions = (widgetInheritOptions?: InheritOptions): string[] => {
    if (!widgetInheritOptions) return [];
    const enabledInheritedOptions: string[] = Object.entries(widgetInheritOptions).filter(([, v]) => v.enabled).map(([k]) => k);
    const nonInheritedOptions: string[] = [];
    Object.keys(widgetInheritOptions).forEach((property) => {
        if (!enabledInheritedOptions.includes(property)) nonInheritedOptions.push(property);
    });
    return nonInheritedOptions;
};
