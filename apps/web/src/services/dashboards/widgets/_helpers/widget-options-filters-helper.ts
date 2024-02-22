import { cloneDeep, union } from 'lodash';

import type { WidgetFiltersMap, WidgetFilterKey } from '@/schema/dashboard/_types/widget-type';

import { MANAGED_WIDGET_FILTERS_SCHEMA_PROPERTIES } from '@/services/dashboards/widgets/_constants/managed-widget-options-schema';


/**
 * @param filtersMap
 * @param filterKey
 * @param value
 */
export const setFilterAndGetWidgetFiltersMap = (filtersMap: WidgetFiltersMap = {}, filterKey: WidgetFilterKey, value: string|string[]): WidgetFiltersMap => {
    const targetProperty = Object.values(MANAGED_WIDGET_FILTERS_SCHEMA_PROPERTIES).find((d) => d.key === filterKey);
    if (!targetProperty) {
        console.error(new Error(`Invalid widget options filter key: ${filterKey}`));
        return filtersMap;
    }

    const _filtersMap = cloneDeep(filtersMap);

    targetProperty.item_options?.forEach((itemOption) => {
        const idKey = itemOption.key;
        const dataKey = itemOption.dataKey;
        if (!idKey && !dataKey) {
            console.error(new Error(`Invalid referencing idKey|dataKey of variable model by options filter key: ${filterKey}`));
        } else {
            const _value: string[] = Array.isArray(value) ? value : [value];
            const filters = _filtersMap[filterKey];
            if (filters?.length) {
                const _originValue = Array.isArray(filters[0].v) ? filters[0].v : [filters[0].v];
                _filtersMap[filterKey] = [{ k: idKey ?? dataKey, v: union(_originValue, _value), o: '=' }];
            } else {
                _filtersMap[filterKey] = [{ k: idKey ?? dataKey, v: _value, o: '=' }];
            }
        }
    });
    return _filtersMap;
};
