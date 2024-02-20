import { cloneDeep } from 'lodash';

import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';

import type { WidgetFiltersMap, WidgetFilterKey } from '@/schema/dashboard/_types/widget-type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed-model-configs/base-managed-model-config';

/**
 * @param filtersMap
 * @param key
 * @param value
 * @param operator
 */
export const setFilterAndGetWidgetFiltersMap = (filtersMap: WidgetFiltersMap, key: WidgetFilterKey, value: null|string|boolean|number, operator: ConsoleFilterOperator = '='): WidgetFiltersMap => {
    const _filtersMap = cloneDeep(filtersMap);
    const filters = _filtersMap[key];
    const filterDataKey = MANAGED_VARIABLE_MODEL_CONFIGS[key].idKey;

    if (!filters) {
        _filtersMap[key] = [{ k: filterDataKey, v: [value], o: operator }];
        return _filtersMap;
    }

    const filter = filters.find((f) => f.o === operator);
    if (!filter) {
        filters.push({ k: filterDataKey, v: [value], o: operator });
        return _filtersMap;
    }

    if (!Array.isArray(filter.v)) {
        filter.v = [filter.v];
    }

    if (filter.v.includes(value)) return _filtersMap;

    filter.v.push(value);
    return _filtersMap;
};
