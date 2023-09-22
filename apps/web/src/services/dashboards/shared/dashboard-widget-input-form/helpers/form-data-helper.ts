import { cloneDeep } from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import {
    getVariableKeyFromWidgetSchemaProperty,
} from '@/services/dashboards/dashboard-create/modules/dashboard-templates/helper';
import type { PartialDashboardLayoutWidgetInfo } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type { InheritOptions, WidgetOptions } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterKey, isWidgetFilterKey } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


export const getInitialFormData = (widgetInfo: PartialDashboardLayoutWidgetInfo|undefined, variableSchema: DashboardVariablesSchema): Record<string, any> => {
    const formData = {};

    const inheritOptions = widgetInfo?.inherit_options ?? {} as InheritOptions;

    widgetInfo?.schema_properties?.forEach((propertyName) => {
        const inheritOption = inheritOptions[propertyName] ?? {};
        // inherit value from dashboard variable case
        if (inheritOption.enabled) {
            formData[propertyName] = getOptionValueFromVariableSchema(propertyName, inheritOption, variableSchema);
        } else {
            // other case
            formData[propertyName] = getOptionValueFromWidgetInfoOptions(propertyName, widgetInfo.widget_options ?? {});
        }
    });

    return formData;
};

const getOptionValueFromVariableSchema = (optionKey: string, inheritOption: InheritOptions['string'], variablesSchema: DashboardVariablesSchema) => {
    if (!inheritOption.enabled) return undefined;

    if (inheritOption.variable_info?.key && variablesSchema.properties[inheritOption.variable_info.key]?.use) {
        return inheritOption.variable_info.key;
    }

    // if variable key is not defined in inherit option, get variable key from dashboard variable schema
    const variableKey = getVariableKeyFromWidgetSchemaProperty(optionKey);
    if (variablesSchema.properties[variableKey]?.use) {
        return variableKey;
    }

    return undefined;
};
const getOptionValueFromWidgetInfoOptions = (optionKey: string, widgetOptions: WidgetOptions) => {
    if (isWidgetFilterKey(optionKey)) {
        const filterKey = getWidgetFilterKey(optionKey);
        const filterValues = widgetOptions.filters?.[filterKey] ?? [];
        if (Array.isArray(filterValues) && filterValues.length > 0) {
            return filterValues.map((filter) => filter.v).flat();
        }
        return undefined;
    }

    return cloneDeep(widgetOptions[optionKey]);
};
