import _ from 'lodash';
import { readonlyArgs } from '@/lib/type';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/type';
import { FilterItem, ListAction, QueryAPI } from '@/lib/fluent-api';
import { StatAction, StatQueryAPI } from '@/lib/fluent-api/statistics/toolset';

export const OPERATOR_MAP = Object.freeze({
    '': 'contain_in', // merge operator
    '!': 'not_contain', // merge operator
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    '=': 'in', // merge operator
    '!=': 'not_in', // merge operator
    $: 'regex',
});
const mergeOperatorSet = new Set(['contain_in', 'not_contain_in', 'in', 'not_in']);

interface Sort {
    key: string;
    desc?: boolean;
}

interface Page {
    start: number;
    limit?: number;
}

interface Filter {
    k?: string;
    o?: string;
    v?: any;
    key?: string;
    operation?: string;
    value?: any;
}

export interface ApiQuery {
    page?: Page;
    sort?: Sort;
    keyword?: string;
    filter?: Filter[];
    only?: readonlyArgs<string[]>;
}

export interface APIParameter{
    query?: ApiQuery;
}
type ValueFormatter = (string, any) => string | number | Array<string | number>;
/**
 * @name defaultQuery
 * @description make default query format
 * @param thisPage
 * @param pageSize
 * @param sortBy
 * @param sortDesc
 * @param searchText
 * @param searchQueries {Array<SearchQueryType>}
 * @param valueFormatter <(key,value)=>value>
 * @param only
 * @returns {{page: {start: number, limit: *}}}
 */
export const defaultQuery = (
    thisPage?: number, pageSize?: number, sortBy?: string, sortDesc?: boolean,
    searchText?: string, searchQueries?: SearchQueryType[] | readonly SearchQueryType[], valueFormatter?: ValueFormatter, only?: string[] | readonly string[],
): ApiQuery => {
    const query: ApiQuery = { };
    if (typeof thisPage === 'number' && typeof pageSize === 'number') {
        query.page = {
            start: ((thisPage - 1) * pageSize) + 1,
            limit: pageSize,
        };
    }
    if (sortBy) {
        query.sort = {
            key: sortBy,
            desc: sortDesc,
        };
    }
    if (only && only.length > 0) {
        query.only = only;
    }
    if (searchText) {
        query.keyword = searchText || '';
    }
    if (searchQueries && searchQueries.length > 0) {
        const filter: Filter[] = [];

        // eslint-disable-next-line camelcase
        const mergeOpQuery: { [propName: string]: Filter } = {};
        searchQueries.forEach((q) => {
            const op = OPERATOR_MAP[q.operator];
            const value = valueFormatter ? valueFormatter(q.key, q.value) : q.value;
            if (mergeOperatorSet.has(op)) {
                const prefix = `${q.key}:${op}`;
                if (mergeOpQuery[prefix]) {
                    mergeOpQuery[prefix].v.push(value);
                } else {
                    mergeOpQuery[prefix] = {
                        k: q.key,
                        v: [value],
                        o: op,
                    };
                }
            } else {
                filter.push({
                    k: q.key,
                    v: value,
                    o: op,
                });
            }
        });
        // eslint-disable-next-line camelcase
        if (!_.isEmpty(filter) || !_.isEmpty(mergeOpQuery)) {
            query.filter = [...filter, ...Object.values(mergeOpQuery)];
        }
    }
    return query;
};
/**
 * make value autocomplete query
 * @param key
 * @param value
 * @param itemLimit
 * @param sortBy
 * @param sortDesc
 * @return {{page: {start: number, limit: *}}}
 */
export const autoCompleteQuery = (searchQuery, itemLimit?: number, sortBy?: string, sortDesc?: boolean, distinct?: boolean) => {
    const query: ApiQuery = {
        page: { start: 1, limit: itemLimit },
        only: [searchQuery.key],
    };
    if (sortBy) {
        query.sort = { key: sortBy, desc: sortDesc };
    }

    if (searchQuery.value) {
        query.filter = [{
            k: searchQuery.key,
            v: searchQuery.value,
            o: 'contain',
        }];
    }
    return query;
};

/**
 * set autocomplete query to given action
 */
export function setActionByQuery
<api extends StatQueryAPI<any, any>|QueryAPI<any, any> = StatQueryAPI<any, any>>(
    action: api,
    searchQuery: FilterItem,
    itemLimit?: number,
    sortBy?: string,
    sortDesc?: boolean,
): api {
    let api;
    if (action instanceof StatQueryAPI) {
        api = action.setDistinct(searchQuery.key);
        api = api.setSort(sortBy || searchQuery.key, sortDesc === undefined ? false : sortDesc);
        if (itemLimit) api = api.setLimit(itemLimit);
    } else if (action instanceof QueryAPI) {
        api = action;
        if (sortBy) {
            api.setSortBy(sortBy);
            if (sortDesc !== undefined) api.setSortDesc(sortDesc);
        }
        if (itemLimit) api = api.setPageSize(itemLimit);
    }



    if (searchQuery.value) api = api.setFilter(searchQuery);
    return api;
}
