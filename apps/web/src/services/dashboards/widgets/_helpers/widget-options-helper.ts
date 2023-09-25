import { merge } from 'lodash';

import type { DashboardVariables } from '@/services/dashboards/config';
import type { InheritOptions, WidgetConfig, WidgetOptions } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterDataKey } from '@/services/dashboards/widgets/_helpers/widget-filters-helper';
import type { InheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';



export const getRefinedWidgetOptions = (
    widgetConfig?: WidgetConfig,
    optionsData?: WidgetOptions,
    mergedInheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): WidgetOptions => {
    const mergedOptions = getMergedWidgetOptions(widgetConfig, optionsData);
    if (!mergedInheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions: Partial<WidgetOptions> = getRefinedParentOptions(mergedInheritOptions, dashboardVariables, optionsErrorMap);
    const refined = merge({}, mergedOptions, parentOptions);
    return refined;
};

const getMergedWidgetOptions = (widgetConfig?: WidgetConfig, widgetOptions?: WidgetOptions) => merge({}, widgetConfig?.options ?? {}, widgetOptions);


const getRefinedParentOptions = (
    inheritOptions: InheritOptions,
    dashboardVariables: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): Partial<WidgetOptions> => {
    const result: Partial<WidgetOptions> = {
        filters: {},
    };
    Object.entries(inheritOptions).forEach(([filterKey, inheritOption]) => {
        if (optionsErrorMap?.[filterKey]) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!inheritOption?.enabled || !variableKey) return;

        const variableValue = dashboardVariables[variableKey];
        if (!variableValue || !variableValue?.length) return;

        if (filterKey.startsWith('filters.')) {
            const _filterKey = filterKey.replace('filters.', '');
            const filterDataKey = getWidgetFilterDataKey(_filterKey);
            result.filters = {
                ...result.filters,
                [_filterKey]: [{ k: filterDataKey, v: variableValue, o: '=' }],
            };
        } else {
            result[filterKey] = variableValue;
        }
    });
    return result;
};
