// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { cloneDeep, union } from 'lodash';

import type { WidgetFiltersMap, WidgetFilterKey } from '@/api-clients/dashboard/_types/widget-type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import { MANAGED_WIDGET_FILTERS_SCHEMA_PROPERTIES } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/managed-widget-options-schema';


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
        const dataKey = itemOption.dataKey;
        const idKey = MANAGED_VARIABLE_MODELS[itemOption.key]?.meta.idKey;
        if (!idKey && !dataKey) {
            console.error(new Error(`Invalid referencing idKey|dataKey of variable model by options filter key: ${filterKey}`));
        } else {
            const _value: string[] = Array.isArray(value) ? value : [value];
            const filters = _filtersMap[filterKey];
            if (filters?.length) {
                const _originValue = Array.isArray(filters[0].v) ? filters[0].v : [filters[0].v];
                _filtersMap[filterKey] = [{ k: dataKey ?? idKey, v: union(_originValue, _value), o: '=' }];
            } else {
                _filtersMap[filterKey] = [{ k: dataKey ?? idKey, v: _value, o: '=' }];
            }
        }
    });
    return _filtersMap;
};
