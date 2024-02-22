import type { WidgetOptionKey, WidgetOptionsSchema, WidgetOptionsSchemaProperty } from '@/schema/dashboard/_types/widget-type';

import {
    WIDGET_FILTERS_SCHEMA_PROPERTIES,
    WIDGET_OPTIONS_SCHEMA_PROPERTIES,
} from '@/services/dashboards/widgets/_constants/widget-managed-options-schema';

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
            properties[optionName] = filterProperty as WidgetOptionsSchemaProperty;
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

            properties[optionName] = defaultProperties;
        } else if (typeof option !== 'string') console.error(new Error(`Wrong format of argument ${option}`));

        order.push(optionName);
    });

    return { properties, order };
};


