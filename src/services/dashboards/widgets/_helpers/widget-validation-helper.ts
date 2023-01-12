import type { TranslateResult } from 'vue-i18n';

import { isEmpty } from 'lodash';

import { i18n } from '@/translations';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type { InheritOptions, WidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/config';


export interface InheritOptionsErrorMap {
    [propertyName: string]: TranslateResult;
}

export const getWidgetInheritOptionsErrorMap = (
    inheritOptions?: InheritOptions,
    widgetOptionsSchema?: WidgetOptionsSchema['schema'],
    dashboardVariables?: DashboardVariables,
    dashboardVariablesSchema?: DashboardVariablesSchema,
): InheritOptionsErrorMap => {
    if (!inheritOptions || isEmpty(inheritOptions)) {
        return {};
    }
    const errorMap: InheritOptionsErrorMap = {};
    Object.entries(inheritOptions).forEach(([propertyName, inheritOption]) => {
        if (!inheritOption?.enabled) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!variableKey || !dashboardVariablesSchema?.properties?.[variableKey] || !dashboardVariables?.[variableKey]) {
            errorMap[propertyName] = i18n.t('This property does not exist on the dashboard variables.');
            return;
        }

        const variableType = dashboardVariablesSchema.properties[variableKey].selection_type === 'MULTI' ? 'array' : 'string';
        const widgetPropertyType = widgetOptionsSchema.properties[propertyName].type;
        if (variableType !== widgetPropertyType) {
            errorMap[propertyName] = i18n.t('This property has a different type from the dashboard variable.');
        }
    });
    return errorMap;
};
