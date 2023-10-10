import { merge } from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import {
    getVariableKeyFromWidgetSchemaProperty,
} from '@/services/dashboards/shared/helpers/dashboard-variable-schema-helper';
import type { InheritOptions, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';

export const getInitialWidgetInheritOptions = (widgetConfig?: WidgetConfig, storedInheritOptions?: InheritOptions, variablesSchema?: DashboardVariablesSchema): InheritOptions => {
    const merged = merge({}, widgetConfig?.inherit_options ?? {}, storedInheritOptions);

    const refined: InheritOptions = {};
    Object.entries(merged).forEach(([property, inheritOption]) => {
        if (inheritOption.enabled === false && inheritOption.variable_info) {
            refined[property] = { enabled: false };
            return;
        }

        const variableKey = getVariableKeyFromWidgetSchemaProperty(property);
        if (variablesSchema && !variablesSchema?.properties[variableKey]?.use) {
            refined[property] = { enabled: false };
            return;
        }

        refined[property] = inheritOption;
    });

    return refined;
};

/**
 * @description get all inheriting properties from inheritOptions.
 * it returns option properties whose inheritOption is enabled and variable_info.key is same with given variableKey.
 * @param variableKey
 * @param inheritOptions
 */
export const getInheritingProperties = (variableKey: string, inheritOptions: InheritOptions) => {
    const properties: string[] = [];
    Object.entries(inheritOptions).forEach(([property, inheritOption]) => {
        if (!inheritOption.enabled) return;
        if (inheritOption.variable_info?.key === variableKey) properties.push(property);
    });
    return properties;
};
