import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type {
    WidgetConfig,
    WidgetFilterKey,
    WidgetFiltersSchemaProperty,
    WidgetOptionsSchemaProperty,
    InheritOptions,
} from '@/services/dashboards/widgets/_configs/config';
import {
    COST_REFERENCE_SCHEMA, GROUP_BY_SCHEMA,
    RESOURCE_REFERENCE_SCHEMA,
} from '@/services/dashboards/widgets/_configs/widget-schema-config';


export const getWidgetOptionsSchema = (...optionNames: WidgetOptionsSchemaProperty[]): object => {
    const result: JsonSchema['properties'] = {};

    optionNames.forEach((optionName) => {
        if (optionName === 'group_by') result.group_by = GROUP_BY_SCHEMA;
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
        else console.error(`No matched filter option schema for ${optionName}`);
    });

    return result;
};


export const getWidgetFilterSchemaPropertyNames = (...keys: WidgetFilterKey[]): WidgetFiltersSchemaProperty[] => keys.map((key) => `filters.${key}` as WidgetFiltersSchemaProperty);
export const getWidgetFilterSchemaPropertyName = (key: WidgetFilterKey): WidgetFiltersSchemaProperty => `filters.${key}`;
export const getWidgetOptionsSchemaPropertyName = (property: WidgetOptionsSchemaProperty): string => { // 'filters.project_group' -> 'Project Group'
    if (property.startsWith('filters.')) {
        return REFERENCE_TYPE_INFO[property.replace('filters.', '')].name;
    }
    if (property === 'group_by') return 'Group By';
    return property;
};

export const getWidgetDefaultInheritOptions = (widgetConfig: WidgetConfig): InheritOptions => {
    const inheritOptions: InheritOptions = {};
    const defaultProperties = widgetConfig.options_schema?.default_properties ?? [];
    const fixedProperties = widgetConfig.options_schema?.fixed_properties ?? [];
    defaultProperties.filter((d) => !fixedProperties.includes(d)).forEach((propertyName) => {
        inheritOptions[propertyName] = {
            enabled: true,
            variable_info: { key: propertyName.replace('filters.', '') },
        };
    });
    return inheritOptions;
};
