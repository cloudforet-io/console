import { isEqual, merge } from 'lodash';

import type { DashboardVariables } from '@/schema/dashboard/_types/dashboard-type';
import type { InheritOptions, WidgetConfig, WidgetOptions } from '@/schema/dashboard/_types/widget-type';

import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-configs/base-managed-model-config';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed-model-configs/base-managed-model-config';

export const getRefinedWidgetOptions = (
    widgetConfig?: WidgetConfig,
    storedOptions?: WidgetOptions,
    mergedInheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
    optionsErrorMap?: Record<string, boolean>,
): WidgetOptions => {
    const mergedOptions = getMergedWidgetOptions(widgetConfig?.options, storedOptions);
    if (!mergedInheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions: Partial<WidgetOptions> = getRefinedParentOptions(mergedInheritOptions, dashboardVariables, optionsErrorMap);
    const refined = getMergedWidgetOptions(mergedOptions, parentOptions);
    return refined;
};

const getMergedWidgetOptions = (source1?: WidgetOptions, source2?: WidgetOptions) => {
    const merged = merge({}, source1 ?? {}, source2 ?? {});
    const filters1 = source1?.filters ?? {};
    const filters2 = source2?.filters ?? {};
    if (isEqual(filters1, filters2)) return merged;
    const mergedFilters = merge({}, filters1, filters2);
    merged.filters = mergedFilters;
    return merged;
};


const getRefinedParentOptions = (
    inheritOptions: InheritOptions,
    dashboardVariables: DashboardVariables,
    optionsErrorMap?: Record<string, boolean>,
): Partial<WidgetOptions> => {
    const result: Partial<WidgetOptions> = {
        filters: {},
    };
    Object.entries(inheritOptions).forEach(([filterKey, inheritOption]) => {
        if (optionsErrorMap?.[filterKey]) return;

        const variableKey = inheritOption?.variable_key;
        if (!inheritOption?.enabled || !variableKey) return;

        const variableValue = dashboardVariables[variableKey];
        if (!variableValue || !variableValue?.length) return;

        if (filterKey.startsWith('filters.')) {
            const _filterKey = filterKey.replace('filters.', '');
            const filterDataKey = MANAGED_VARIABLE_MODEL_CONFIGS[_filterKey as ManagedVariableModelKey]?.idKey;
            if (!filterDataKey) {
                console.error(new Error(`No filter data key for ${_filterKey}`));
                return;
            }
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
