import _ from 'lodash';
import { readonlyArgs } from '@/lib/type';
import { OPERATOR_MAP } from '@/lib/fluent-api/toolset';

const mergeOperatorSet = new Set(['contain_in', 'not_contain_in', 'in', 'not_in']);

interface SearchQueryType {
    key: string;
    operator: string;
    value: any;
}

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
