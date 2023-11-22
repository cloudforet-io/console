import { cloneDeep, isEmpty, isEqual } from 'lodash';

import { isObjectEqual } from '@cloudforet/core-lib';

import type {
    InheritOptions, WidgetConfig, WidgetFiltersMap, WidgetOptions,
} from '@/schema/dashboard/_types/widget-type';

import { getInheritingOptionKeys } from '@/services/dashboards/widgets/_helpers/widget-inherit-options-helper';
import { getWidgetOptionKeyByVariableKey } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import type { UpdatableWidgetInfo } from '@/services/dashboards/widgets/_types/widget-type';

/**
 * @description get updated widget info. if the property is not changed, it will be declared as undefined.
 * @param widgetConfig
 * @param mergedWidgetInfo
 */
export const getUpdatedWidgetInfo = (widgetConfig: WidgetConfig, mergedWidgetInfo: UpdatableWidgetInfo): UpdatableWidgetInfo => {
    const configWidgetOptions = widgetConfig.options ?? {};
    const inheritOptions = mergedWidgetInfo.inherit_options ?? {};
    const updatedInheritOptions: InheritOptions = cloneDeep(inheritOptions) ?? {};
    const updatedWidgetOptions: WidgetOptions = cloneDeep(mergedWidgetInfo.widget_options) ?? {};
    const schemaProperties = mergedWidgetInfo.schema_properties ?? [];

    Object.entries(updatedInheritOptions).forEach(([key]) => {
        if (!schemaProperties.includes(key)) {
            delete updatedInheritOptions[key];
        }
    });

    Object.entries(updatedWidgetOptions).forEach(([key, val]) => {
        // filter case
        if (key === 'filters') {
            if (!val) return;
            Object.entries(val).forEach(([filterKey, filterVal]) => {
                const optionKey = getWidgetOptionKeyByVariableKey(filterKey);
                const isInherited = getInheritingOptionKeys(filterKey, updatedInheritOptions).length > 0;
                // if the filter is not in the schemaProperties or inherited, it will be deleted.
                if (!schemaProperties.includes(optionKey as string)) {
                    delete (updatedWidgetOptions.filters as WidgetFiltersMap)[filterKey];
                } else if (isInherited) {
                    delete (updatedWidgetOptions.filters as WidgetFiltersMap)[filterKey];
                // if the filter is not changed, it will be deleted.
                } else if (isObjectEqual(filterVal, configWidgetOptions.filters?.[filterKey])) {
                    delete (updatedWidgetOptions.filters as WidgetFiltersMap)[filterKey];
                }
            });
        // other widget option case
        } else {
            const isInherited = getInheritingOptionKeys(key, updatedInheritOptions).length > 0;
            // if the widget option is not in the schemaProperties or inherited, it will be deleted.
            if (!schemaProperties.includes(key)) {
                delete updatedWidgetOptions[key];
            } else if (isInherited) {
                delete updatedWidgetOptions[key];
            // if the widget option is not changed, it will be deleted.
            } else if (isEqual(val, configWidgetOptions[key])) {
                delete updatedWidgetOptions[key];
            }
        }
    });

    return {
        title: mergedWidgetInfo.title === widgetConfig.title ? undefined : mergedWidgetInfo.title,
        inherit_options: isEmpty(updatedInheritOptions) ? undefined : updatedInheritOptions,
        widget_options: isEmpty(updatedWidgetOptions) ? undefined : updatedWidgetOptions,
        schema_properties: schemaProperties.length ? schemaProperties : undefined,
    };
};
