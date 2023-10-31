import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type { InheritOptions, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';

export const getInitialWidgetInheritOptions = (
    widgetConfig?: WidgetConfig,
    storedInheritOptions?: InheritOptions,
    variablesSchema?: DashboardVariablesSchema,
): InheritOptions => {
    const refined: InheritOptions = {};

    Object.entries(widgetConfig?.options_schema?.properties ?? {}).forEach(([optionName, property]) => {
        const inheritOption = storedInheritOptions?.[optionName];
        const inheritanceMode = property.inheritance_mode;

        if (inheritanceMode === 'NONE') return;

        if (!inheritanceMode || inheritanceMode === 'KEY_MATCHING') { // default inheritance mode is KEY_MATCHING
            const variableKey = property.key;
            const variableProperty = variablesSchema?.properties[variableKey];
            if (!variableKey) return;
            if (!variableProperty?.use) return;
            refined[optionName] = { enabled: true, variable_key: variableKey };
            return;
        }

        // inheritanceMode === 'SELECTION_TYPE_MATCHING'
        if (inheritOption?.enabled) {
            const variableKey = inheritOption.variable_key;

            if (variableKey) {
                const variableProperty = variablesSchema?.properties[variableKey];
                if (variableProperty?.use) {
                    // if variable is available, use it
                    refined[optionName] = { enabled: true, variable_key: variableKey };
                }
            }

            // find variable key from variables schema by selection type
            const matchedPropertyTuples = Object.entries(variablesSchema?.properties ?? {})
                .find(([, d]) => d.use && d.selection_type === property.selection_type);
            if (matchedPropertyTuples) {
                refined[optionName] = { enabled: true, variable_key: matchedPropertyTuples[0] };
            }
        }
    });

    return refined;
};

/**
 * @description get all inheriting properties from inheritOptions.
 * it returns option properties whose inheritOption is enabled and variable_key is same with given variableKey.
 * @param variableKey
 * @param inheritOptions
 */
export const getInheritingProperties = (variableKey: string, inheritOptions: InheritOptions) => {
    const properties: string[] = [];
    Object.entries(inheritOptions).forEach(([property, inheritOption]) => {
        if (!inheritOption.enabled) return;
        if (inheritOption.variable_key === variableKey) properties.push(property);
    });
    return properties;
};
