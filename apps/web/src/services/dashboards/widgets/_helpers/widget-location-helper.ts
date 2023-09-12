import type { WidgetFiltersMap } from '@/services/dashboards/widgets/_configs/config';

/**
 * @name getWidgetLocationFilters
 * @param widgetFilters
 * @example { provider: [{k: 'provider', v: ['aws', 'google'], o: '='}] }
 * => { provider: [{k: 'provider', v: 'aws', o: '='}, {k: 'provider', v: 'google', o: '='}] }
 * @description This helper is used to sync with the cost analysis page. Will be deprecated soon.
 */
export const getWidgetLocationFilters = (widgetFilters?: WidgetFiltersMap): WidgetFiltersMap => {
    const result: WidgetFiltersMap = {};
    Object.entries(widgetFilters ?? {}).forEach(([filterKey, filterItems]) => {
        result[filterKey] = [];
        filterItems.forEach((filterItem) => {
            if (Array.isArray(filterItem.v)) {
                filterItem.v.forEach((d) => {
                    result[filterKey].push({
                        k: filterKey, o: filterItem.o, v: d,
                    });
                });
            } else {
                result[filterKey].push({
                    k: filterKey, o: filterItem.o, v: filterItem.v,
                });
            }
        });
    });
    return result;
};
