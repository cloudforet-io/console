import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { WidgetFiltersMap } from '@/services/dashboards/widgets/_configs/config';


/**
 * @name getWidgetLocationFilters
 * @param widgetFilters
 * @example { provider: [{k: 'provider', v: ['aws', 'google'], o: '='}] }
 * => [{k: 'provider', v: ['aws', 'google'], o: '='}, {k: 'product', v: ['AWSELB'], o: '='}]
 */
export const getWidgetLocationFilters = (widgetFilters?: WidgetFiltersMap): ConsoleFilter[] => {
    const consoleFilters: ConsoleFilter[] = [];
    Object.values(widgetFilters ?? {}).forEach((filterItems) => {
        consoleFilters.push(...filterItems);
    });
    return consoleFilters;
};
