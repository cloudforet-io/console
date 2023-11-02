import {
    chain, get, union,
} from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    InheritOptions,
    WidgetConfig,
    WidgetOptions,
} from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetFilterKey,
    WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';
import {
    WIDGET_FILTERS_SCHEMA_PROPERTIES,
    WIDGET_OPTIONS_SCHEMA_PROPERTIES,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';

const VAR_KEY_TO_OPTION_KEY_MAP = {};
Object.entries(WIDGET_FILTERS_SCHEMA_PROPERTIES).forEach(([optionKey, property]) => {
    const variableKey = property.key;
    if (variableKey) VAR_KEY_TO_OPTION_KEY_MAP[variableKey] = optionKey;
});
Object.entries(WIDGET_OPTIONS_SCHEMA_PROPERTIES).forEach(([optionKey, property]) => {
    const variableKey = property.key;
    if (variableKey) VAR_KEY_TO_OPTION_KEY_MAP[variableKey] = optionKey;
});

export const getWidgetOptionKeyByVariableKey = (key: string): WidgetFilterKey|undefined => VAR_KEY_TO_OPTION_KEY_MAP[key];

export const getNonInheritedWidgetOptionsAmongUsedVariables = (
    variablesSchema: DashboardVariablesSchema,
    widgetInheritOptions: InheritOptions = {},
    schemaProperties: string[] = [],
): string[] => {
    const nonInheritedOptionKeys: string[] = [];
    const enabledInheritedOptionKeys = Object.values(widgetInheritOptions)
        .filter((inheritOption) => inheritOption?.enabled)
        .map((inheritOption) => inheritOption?.variable_key);
    if (variablesSchema?.properties) {
        Object.entries(variablesSchema.properties).forEach(([key, property]) => {
            const optionKey = getWidgetOptionKeyByVariableKey(key);
            if (optionKey
                && property.use
                && schemaProperties.includes(optionKey)
                && !enabledInheritedOptionKeys.includes(optionKey)) nonInheritedOptionKeys.push(optionKey);
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
): string[] => {
    const optionExistProperties = storedProperties.filter((property) => !!get(widgetOptions, property));
    return union(initialProperties, optionExistProperties);
};
