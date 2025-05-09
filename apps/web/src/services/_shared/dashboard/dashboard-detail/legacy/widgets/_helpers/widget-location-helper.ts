import type { Location } from 'vue-router/types/router';

import { cloneDeep } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { WidgetFiltersMap } from '@/api-clients/dashboard/_types/widget-type';

import { arrayToQueryString, queryStringToArray } from '@/lib/router-query-string';

import type { WidgetTableData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-data-table-type';



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


export const getWidgetDataTableRowLocation = (rowData?: WidgetTableData, widgetLocation?: Location, targetFields?: string[]): Location|undefined => {
    if (!rowData?.item || !widgetLocation || !targetFields?.length) return undefined;
    const _widgetLocation = cloneDeep(widgetLocation);
    const _queryFilters = queryStringToArray(_widgetLocation.query?.filters) ?? [];
    targetFields.forEach((field) => {
        const split = field.split('.');
        const parsedField = split.length > 0 ? (split.pop() ?? '') : (field ?? '');
        if (rowData?.item[parsedField]) {
            _queryFilters.push({ k: field, v: [rowData.item[parsedField]], o: '=' });
        }
    });
    return {
        ..._widgetLocation,
        query: {
            ..._widgetLocation.query,
            filters: arrayToQueryString(_queryFilters),
        },
    };
};
