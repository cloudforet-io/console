import { chain, get, union } from 'lodash';

import type { DashboardVariablesSchema } from '@/api-clients/dashboard/_types/dashboard-type';
import type {
    InheritOptions, WidgetConfig, WidgetFilterOptionKey, WidgetOptions, WidgetOptionsSchema,
} from '@/api-clients/dashboard/_types/widget-type';

import {
    MANAGED_WIDGET_FILTERS_SCHEMA_PROPERTIES,
    MANAGED_WIDGET_OPTIONS_SCHEMA_PROPERTIES,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/managed-widget-options-schema';

const VAR_KEY_TO_OPTION_KEY_MAP = {};
Object.entries(MANAGED_WIDGET_FILTERS_SCHEMA_PROPERTIES).forEach(([optionKey, property]) => {
    const variableKey = property.key;
    if (variableKey) VAR_KEY_TO_OPTION_KEY_MAP[variableKey] = optionKey;
});
Object.entries(MANAGED_WIDGET_OPTIONS_SCHEMA_PROPERTIES).forEach(([optionKey, property]) => {
    const variableKey = property.key;
    if (variableKey) VAR_KEY_TO_OPTION_KEY_MAP[variableKey] = optionKey;
});

export const getWidgetOptionKeyByVariableKey = (key: string): WidgetFilterOptionKey|undefined => VAR_KEY_TO_OPTION_KEY_MAP[key];

export const getNonInheritedWidgetOptionNamesAmongUsedVariables = (
    variablesSchema: DashboardVariablesSchema,
    widgetInheritOptions: InheritOptions = {},
    schemaProperties: string[] = [],
): string[] => {
    const nonInheritedOptionKeys: string[] = [];
    const enabledInheritedOptionKeys = Object.entries(widgetInheritOptions)
        .filter(([, inheritOption]) => inheritOption?.enabled)
        .map(([propertyName]) => propertyName);
    if (variablesSchema?.properties) {
        Object.entries(variablesSchema.properties).forEach(([key, property]) => {
            const optionKey = getWidgetOptionKeyByVariableKey(key);
            if (optionKey
                && property.use
                && schemaProperties.includes(optionKey)
                && !enabledInheritedOptionKeys.includes(optionKey)) {
                const refinedName = MANAGED_WIDGET_FILTERS_SCHEMA_PROPERTIES[optionKey]?.name ?? MANAGED_WIDGET_OPTIONS_SCHEMA_PROPERTIES[optionKey]?.name ?? optionKey;
                nonInheritedOptionKeys.push(refinedName);
            }
        });
    }
    return nonInheritedOptionKeys;
};

export const getInitialSchemaProperties = (
    widgetConfig?: WidgetConfig,
    variablesSchema?: DashboardVariablesSchema,
): string[] => {
    const widgetOptionsSchema = widgetConfig?.options_schema ?? {} as WidgetOptionsSchema;
    const allVariableProperties = Object.keys(variablesSchema?.properties ?? {});
    const allOptionProperties = Object.keys(widgetOptionsSchema?.properties ?? {});
    const fixedProperties = allOptionProperties.filter((key) => widgetOptionsSchema?.properties?.[key]?.fixed);
    const order: string[] = widgetOptionsSchema?.order ?? [];

    // get variable key to option name map
    const variableKeyToOptionNameMap = {};
    Object.entries(widgetConfig?.options_schema?.properties ?? {}).forEach(([optionName, property]) => {
        const variableKey = property.key;
        if (variableKey) variableKeyToOptionNameMap[variableKey] = optionName;
    });

    return chain(allVariableProperties) // get all possible properties from variables schema
        .filter((key) => !!variablesSchema?.properties?.[key]?.use) // get only used variables
        .filter((key) => fixedProperties.map((k) => k.replace('filters.', '')).includes(key)) // filter only fixed widget properties
        .map((key) => variableKeyToOptionNameMap[key]) // convert variable key to option name
        .intersection(allOptionProperties) // intersect with all possible properties from widget options schema
        .union(fixedProperties) // union with fixed properties
        .sortBy((key) => {
            const idx = order.indexOf(key);
            if (idx < 0) return 9999;
            if (fixedProperties.includes(key)) return idx;
            return 1000 + idx;
        }) // sort by order and fixedProperties
        .value();
};

export const getRefinedSchemaProperties = (
    storedProperties: string[],
    initialProperties: string[],
    widgetOptions?: WidgetOptions,
    inheritOptions?: InheritOptions,
): string[] => {
    const merged = union(initialProperties, storedProperties);
    return merged.reduce((results, property) => {
        const isStored = storedProperties.includes(property);
        const isInitial = initialProperties.includes(property);
        if (isStored && isInitial) {
            results.push(property);
        } else if (isStored && !isInitial) {
            if (get(widgetOptions, property)) results.push(property);
        } else if (!isStored && isInitial) {
            if (inheritOptions?.[property]?.enabled) results.push(property);
        }
        return results;
    }, [] as string[]);
};
