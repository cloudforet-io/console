import {
    chain, get, union,
} from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    WidgetFilterKey,
    InheritOptions,
    WidgetConfig,
    WidgetOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_FILTER_KEYS } from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';

export const getWidgetOptionName = (key: string): string => {
    if (WIDGET_FILTER_KEYS.includes(key as WidgetFilterKey)) return `filters.${key}`;
    return key;
};

export const getNonInheritedWidgetOptionsAmongUsedVariables = (
    variablesSchema: DashboardVariablesSchema,
    widgetInheritOptions: InheritOptions = {},
    schemaProperties: string[] = [],
): string[] => {
    const nonInheritedOptions: string[] = [];
    const enabledInheritedOptions = Object.entries(widgetInheritOptions).filter(([, inheritOption]) => inheritOption?.enabled).map(([key, inheritOption]) => inheritOption?.variable_key ?? key);
    if (variablesSchema?.properties) {
        Object.entries(variablesSchema.properties).forEach(([key, property]) => {
            const optionName = getWidgetOptionName(key);
            if (property.use && schemaProperties.includes(optionName) && !enabledInheritedOptions.includes(key)) nonInheritedOptions.push(optionName);
        });
    }
    return nonInheritedOptions;
};

export const getInitialSchemaProperties = (
    widgetConfig?: WidgetConfig,
    variablesSchema?: DashboardVariablesSchema,
): string[] => {
    const widgetOptionsSchema = widgetConfig?.options_schema ?? {} as WidgetOptionsSchema;
    const allVariableProperties = Object.keys(variablesSchema?.properties ?? {});
    const allOptionProperties = Object.keys(widgetOptionsSchema?.properties ?? {});
    const fixedProperties = allOptionProperties.filter((key) => !widgetOptionsSchema?.properties?.[key]?.optional);
    const order: string[] = widgetOptionsSchema?.order ?? [];

    return chain(allVariableProperties) // get all possible properties from variables schema
        .filter((key) => !!variablesSchema?.properties?.[key]?.use) // get only used variables
        .map((key) => getWidgetOptionName(key)) // convert variable key to widget option name
        .intersection(allOptionProperties) // intersect with all possible properties from widget options schema
        .union(fixedProperties) // union with fixed properties
        .sortBy((key) => {
            const idx = order.indexOf(key);
            if (idx >= 0) return idx;
            if (fixedProperties.includes(key)) return -1;
            return 9999;
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
