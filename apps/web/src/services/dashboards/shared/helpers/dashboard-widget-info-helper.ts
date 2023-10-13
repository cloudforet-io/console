import { cloneDeep, isEmpty, isEqual } from 'lodash';

import { isObjectEqual } from '@cloudforet/core-lib';

import type {
    InheritOptions, UpdatableWidgetInfo,
    WidgetConfig, WidgetFiltersMap,
    WidgetOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { getInheritingProperties } from '@/services/dashboards/widgets/_helpers/widget-inherit-options-helper';
import { getWidgetOptionName } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

/**
 * @description get updated widget info. if the property is not changed, it will be declared as undefined.
 * @param widgetConfig
 * @param mergedWidgetInfo
 */
export const getUpdatedWidgetInfo = (widgetConfig: WidgetConfig, mergedWidgetInfo: UpdatableWidgetInfo): UpdatableWidgetInfo => {
    const configInheritOptions = widgetConfig.inherit_options ?? {};
    const configWidgetOptions = widgetConfig.options ?? {};
    const mergedInheritOptions = mergedWidgetInfo.inherit_options ?? {};
    const updatedInheritOptions: InheritOptions = cloneDeep(mergedInheritOptions);
    const updatedWidgetOptions: WidgetOptions = cloneDeep(mergedWidgetInfo.widget_options) ?? {};
    const schemaProperties = mergedWidgetInfo.schema_properties ?? [];

    Object.entries(updatedInheritOptions).forEach(([key, inheritOption]) => {
        if (!schemaProperties.includes(key) || isObjectEqual(inheritOption, configInheritOptions[key])) {
            delete updatedInheritOptions[key];
        }
    });

    Object.entries(updatedWidgetOptions).forEach(([key, val]) => {
        // filter case
        if (key === 'filters') {
            if (!val) return;
            Object.entries(val).forEach(([filterKey, filterVal]) => {
                const optionKey = getWidgetOptionName(filterKey);
                const isInherited = getInheritingProperties(filterKey, updatedInheritOptions).length > 0;
                // if the filter is not in the schemaProperties or inherited, it will be deleted.
                if (!schemaProperties.includes(optionKey)) {
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
            const isInherited = getInheritingProperties(key, updatedInheritOptions).length > 0;
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
        size: mergedWidgetInfo.size === widgetConfig.sizes?.[0] ? undefined : mergedWidgetInfo.size,
    };
};
