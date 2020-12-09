import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import { KeyItem, KeyItemSet, OperatorType } from '@/components/organisms/search/query-search/type';
import { Filter, FilterOperator } from '@/lib/space-connector/type';
import { find, flatten } from 'lodash';
import {
    ApiQuery, QueryStoreFilter, RawQuery, RawQueryOperator,
} from '@/lib/query/type';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import { store } from '@/store';

dayjs.extend(utc);
dayjs.extend(tz);

const rawQueryOperatorToApiQueryOperatorMap: Record<RawQueryOperator, FilterOperator> = {
    '': 'contain',
    '!': 'not_contain',
    '=': 'eq',
    '!=': 'not',
    /* single only */
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    $: 'regex',
    /* datetime only */
    '>t': 'datetime_gt',
    '>=t': 'datetime_gte',
    '<t': 'datetime_lt',
    '<=t': 'datetime_lte',
    '=t': 'datetime_gt',
};

const datetimeRawQueryOperatorToQueryTagOperatorMap: Partial<Record<RawQueryOperator, OperatorType>> = {
    '>t': '>',
    '>=t': '>=',
    '<t': '<',
    '<=t': '<=',
    '=t': '=',
};

export class QueryStore {
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
        this._filters = filters;
        return this;
    }

    get filters(): QueryStoreFilter[] {
        return this._filters;
    }

    get queryTags(): QueryTag[] {
        const res: QueryTag[] = [];
        this._filters.forEach((f) => {
            if (f.k === undefined || f.k === null) {
                /* no key case */
                res.push({ value: { label: f.v, name: f.v } });
            } else if (datetimeRawQueryOperatorToQueryTagOperatorMap[f.o as string]) {
                /* datetime case */
                const key = this._keyMap[f.k] || { label: f.k, name: f.k };
                key.dataType = 'datetime';
                res.push({
                    key,
                    value: { label: f.v, name: f.v },
                    operator: datetimeRawQueryOperatorToQueryTagOperatorMap[f.o as string],
                });
            } else if (f.v === null || f.v === undefined) {
                /* null case */
                res.push({
                    key: this._keyMap[f.k] || { label: f.k, name: f.k },
                    value: { label: 'Null', name: null },
                    operator: f.o && f.o.startsWith('!') ? '!' : '=',
                });
            } else {
                /* general case */
                res.push({
                    key: this._keyMap[f.k] || { label: f.k, name: f.k },
                    value: { label: f.v, name: f.v },
                    operator: datetimeRawQueryOperatorToQueryTagOperatorMap[f.o as string] || f.o || '' as OperatorType,
                });
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

    get apiQuery(): ApiQuery {
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
                } else {
                    /* general case */
                    filter.push({ k: f.k, v: f.v, o: rawQueryOperatorToApiQueryOperatorMap[f.o || ''] });
                }
            } else if (f.v !== null) keyword.push(f.v);
        });
        return {
            filter,
            keyword: keyword.join(' '),
        };
    }
}
