
import { isEmpty } from 'lodash';
import { useI18n } from 'vue-i18n';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type { InheritOptions, WidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/config';


export interface InheritOptionsErrorMap {
    [propertyName: string]: string;
}

export const getWidgetInheritOptionsErrorMap = (
    inheritOptions?: InheritOptions,
    widgetOptionsSchema?: WidgetOptionsSchema['schema'],
    dashboardVariablesSchema?: DashboardVariablesSchema,
): InheritOptionsErrorMap => {
    const { t } = useI18n();
    if (!inheritOptions || isEmpty(inheritOptions)) {
        return {};
    }
    const errorMap: InheritOptionsErrorMap = {};
    Object.entries(inheritOptions).forEach(([propertyName, inheritOption]) => {
        if (!inheritOption?.enabled) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!variableKey) return;
        if (!dashboardVariablesSchema?.properties?.[variableKey]?.use) {
            errorMap[propertyName] = t('DASHBOARDS.WIDGET.VALIDATION_PROPERTY_NOT_EXIST');
            return;
        }

        const variableType = dashboardVariablesSchema.properties[variableKey].selection_type === 'MULTI' ? 'array' : 'string';
        const widgetPropertyType = widgetOptionsSchema?.properties?.[propertyName]?.type;
        if (variableType !== widgetPropertyType) {
            errorMap[propertyName] = t('DASHBOARDS.WIDGET.VALIDATION_PROPERTY_NOT_EXIST');
        }
    });
    return errorMap;
};
