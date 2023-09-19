import { cloneDeep } from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type { PartialDashboardLayoutWidgetInfo } from '@/services/dashboards/store/widget-form';
import type { InheritOptions, WidgetOptions } from '@/services/dashboards/widgets/_configs/config';


export const getInitialFormData = (widgetInfo: PartialDashboardLayoutWidgetInfo, variableSchema: DashboardVariablesSchema): Record<string, any> => {
    const formData = {};

    const inheritOptions = widgetInfo.inherit_options ?? {} as InheritOptions;

    widgetInfo.schema_properties?.forEach((propertyName) => {
        const inheritOption = inheritOptions[propertyName] ?? {};
        // inherit value from dashboard variable case
        if (inheritOption.enabled) {
            formData[propertyName] = getOptionValueFromVariableSchema(propertyName, inheritOption, variableSchema);
        } else {
            // other case
            formData[propertyName] = getOptionKeyAndValueFromWidgetInfoOptions(propertyName, widgetInfo.widget_options ?? {});
        }
    });

    return formData;
};

const getOptionValueFromVariableSchema = (optionKey: string, inheritOption: InheritOptions['string'], variablesSchema: DashboardVariablesSchema) => {
    const variableKey = optionKey.replace('filters.', '');
    // check if variable is available
    if (inheritOption.variable_info?.key === variableKey && variablesSchema.properties[variableKey]?.use) {
        return variableKey;
    }
    return undefined;
};
const getOptionKeyAndValueFromWidgetInfoOptions = (optionKey: string, widgetOptions: WidgetOptions) => {
    if (optionKey.startsWith('filters')) {
        const filterKey = optionKey.replace('filters.', '');
        const filterValues = widgetOptions.filters?.[filterKey] ?? [];
        if (Array.isArray(filterValues)) {
            return filterValues.map((filter) => filter.v).flat();
        }
        return undefined;
    }
    return cloneDeep(widgetOptions[optionKey]);
};
