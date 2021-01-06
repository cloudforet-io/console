import { QueryTag as Tag } from '@spaceone/design-system/dist/src/organisms/search/query-search-tags/type';
import {
    KeyItem,
    KeyItemSet,
    OperatorType,
    QueryItem,
} from '@spaceone/design-system/dist/src/organisms/search/query-search/type';
import { Filter, FilterOperator, Query } from '@/lib/space-connector/type';
import { flatten } from 'lodash';
import {
    QueryStoreFilter, QueryStoreFilterValue, RawQuery, RawQueryOperator,
} from '@/lib/query/type';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import {
    datetimeRawQueryOperatorToQueryTagOperatorMap, rawQueryOperatorToApiQueryOperatorMap,
    rawQueryOperatorToPluralApiQueryOperatorMap,
} from '@/lib/query/config';
import { store } from '@/store';

dayjs.extend(utc);
dayjs.extend(tz);


interface QueryTag extends Tag, QueryItem {}
const filterToQueryTag = (filter: { k?: string; v: QueryStoreFilterValue; o?: RawQueryOperator }, keyMap: Record<string, KeyItem>): QueryTag | null => {
    if (filter.k === undefined || filter.k === null) {
        /* no key case */
        if (filter.v === null) return null;
        return { value: { label: filter.v.toString(), name: filter.v } };
    }
    if (filter.v === null || filter.v === undefined) {
        /* null case */
        return {
            key: keyMap[filter.k] || { label: filter.k, name: filter.k },
            value: { label: 'Null', name: null },
            operator: filter.o && filter.o.startsWith('!') ? '!' : '=',
        };
    }
    if (datetimeRawQueryOperatorToQueryTagOperatorMap[filter.o as string]) {
        /* datetime case */
        const key = keyMap[filter.k] || { label: filter.k, name: filter.k };
        key.dataType = 'datetime';
        return {
            key,
            value: { label: filter.v.toString(), name: filter.v },
            operator: datetimeRawQueryOperatorToQueryTagOperatorMap[filter.o as string],
        };
    }
    /* general case */
    return {
        key: keyMap[filter.k] || { label: filter.k, name: filter.k },
        value: { label: filter.v.toString(), name: filter.v },
        operator: datetimeRawQueryOperatorToQueryTagOperatorMap[filter.o as string] || filter.o || '' as OperatorType,
    };
};

export class QueryHelper {
    private _keyMap: Record<string, KeyItem> = {}

    private _filters: QueryStoreFilter[] = [];

    setKeyItemSets(keyItemSets: KeyItemSet[]): this {
        this._keyMap = {};
        flatten(keyItemSets.map(d => d.items)).forEach((d) => {
            this._keyMap[d.name] = d;
        });
        return this;
    }

    setFiltersAsQueryTag(queryTags: QueryTag[], keyItemSets?: KeyItemSet[]): this {
        if (keyItemSets) this.setKeyItemSets(keyItemSets);
        this._filters = [];
        queryTags.forEach((q) => {
            if (!q.invalid) {
                if (q.key) {
                    this._filters.push({
                        k: q.key.name,
                        v: q.value.name,
                        o: (q.key.dataType === 'datetime' ? `${q.operator}t` : q.operator) as RawQueryOperator,
                    });
                } else this._filters.push({ v: q.value.name });
            }
        });
        return this;
    }

    setFiltersAsRawQuery(rawQueries: RawQuery[]): this {
        this._filters = rawQueries.map((q) => {
            const [v, k, o] = q;
            return { k, v, o };
        });
        return this;
    }

    setFiltersAsRawQueryString(rawQueryStrings: undefined|string|(string|null)[]): this {
        this._filters = [];
        if (Array.isArray(rawQueryStrings)) {
            rawQueryStrings.forEach((q) => {
                if (q) {
                    const [v, k, o] = JSON.parse(q) as RawQuery;
                    this._filters.push({ k, v, o });
                }
            });
        } else if (typeof rawQueryStrings === 'string') {
            const [v, k, o] = JSON.parse(rawQueryStrings) as RawQuery;
            this._filters.push({ k, v, o });
        }
        return this;
    }

    setFilters(filters: QueryStoreFilter[]): this {
        this._filters = [...filters];
        return this;
    }

    addFilter(...filters: QueryStoreFilter[]): this {
        this._filters.push(...filters);
        return this;
    }

    get filters(): QueryStoreFilter[] {
        return [...this._filters];
    }

    get queryTags(): QueryTag[] {
        const res: QueryTag[] = [];
        this._filters.forEach((f) => {
            if (Array.isArray(f.v)) {
                f.v.forEach((v) => {
                    const tag = filterToQueryTag({ k: f.k, v, o: f.o }, this._keyMap);
                    if (tag) res.push(tag);
                });
            } else {
                const tag = filterToQueryTag(f as any, this._keyMap);
                if (tag) res.push(tag);
            }
        });
        return res;
    }

    get rawQueries(): RawQuery[] {
        return this._filters.map((f) => {
            if (f.k) {
                if (f.o) return [f.v, f.k, f.o];
                return [f.v, f.k];
            }
            return [f.v];
        });
    }

    get rawQueryStrings(): string[] {
        return this.rawQueries.map(q => JSON.stringify(q));
    }

    get apiQuery(): Required<Pick<Query, 'filter'|'keyword'>> {
        const filter: Filter[] = [];
        const keyword: string[] = [];

        this._filters.forEach((f) => {
            if (f.k) {
                if (typeof f.v === 'string' && datetimeRawQueryOperatorToQueryTagOperatorMap[f.o as string]) {
                    /* datetime case */
                    const time = dayjs.tz(f.v, store.state.user.timezone).utc();

                    if (f.o === '>t' || f.o === '>=t') {
                        filter.push({ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] });
                    } else if (f.o === '<t' || f.o === '<=t') {
                        filter.push({ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<=t'] });
                    } else {
                        filter.push({ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] });
                        filter.push({ k: f.k, v: time.add(1, 'day').toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<'] });
                    }
                } else if (Array.isArray(f.v)) {
                    /* plural case */
                    if (rawQueryOperatorToPluralApiQueryOperatorMap[f.o || '']) {
                        filter.push({ k: f.k, v: f.v, o: rawQueryOperatorToPluralApiQueryOperatorMap[f.o || ''] as FilterOperator });
                    } else {
                        f.v.forEach((v) => {
                            filter.push({ k: f.k as string, v, o: rawQueryOperatorToApiQueryOperatorMap[f.o || ''] });
                        });
                    }
                } else if (f.v === null || f.v === undefined) {
                    /* null case */
                    const op = f.o && f.o.startsWith('!') ? '!' : '=';
                    filter.push({ k: f.k, v: null, o: rawQueryOperatorToApiQueryOperatorMap[op] });
                } else {
                    /* general case */
                    filter.push({ k: f.k, v: f.v, o: rawQueryOperatorToApiQueryOperatorMap[f.o || ''] });
                }
            } else if (f.v !== null && f.v !== undefined) {
                /* keyword case */
                if (Array.isArray(f.v)) keyword.push(...f.v.map(v => (v !== null ? v.toString() : '')));
                else keyword.push(f.v.toString());
            }
        });
        return {
            filter,
            keyword: keyword.join(' ') || '',
        };
    }
}
