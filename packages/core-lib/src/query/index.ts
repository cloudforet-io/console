import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { flatten, forEach } from 'lodash';
import type { LocationQueryValue } from 'vue-router';

import type {
    QueryTag as Tag,
    KeyItem,
    KeyItemSet,
    OperatorType,
    QueryItem,
} from '@/component-util/query-search/type';
import {
    datetimeRawQueryOperatorToQueryTagOperatorMap, rawQueryOperatorToApiQueryOperatorMap,
    rawQueryOperatorToPluralApiQueryOperatorMap,
} from '@/query/config';
import { convertDatetimeQueryStoreFilterToFilters } from '@/query/helper';
import type {
    ConsoleFilter, ConsoleFilterValue, RawQuery, ConsoleFilterOperator,
} from '@/query/type';
import type { ApiFilter, ApiFilterOperator } from '@/space-connector/type';

dayjs.extend(utc);
dayjs.extend(tz);

interface QueryTag extends Tag, QueryItem {}
type ReferenceStore = Record<string, any>;

const filterToQueryTag = (
    filter: { k?: string; v: ConsoleFilterValue; o?: ConsoleFilterOperator },
    keyMap: Record<string, KeyItem>,
    referenceStore: ReferenceStore | undefined,
): QueryTag | null => {
    if (filter.k === undefined || filter.k === null) {
        /* no key case */
        if (filter.v === null || filter.v === undefined) return null;
        return { value: { label: filter.v?.toString() ?? 'Null', name: filter.v } };
    }
    if (filter.v === null || filter.v === undefined) {
        /* null case */
        return {
            key: keyMap[filter.k] || { label: filter.k, name: filter.k },
            value: { label: 'Null', name: null },
            operator: filter.o?.startsWith('!') ? '!=' : '=',
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
    const reference = keyMap[filter.k]?.reference;
    const selectedReferenceStore = (reference && referenceStore) ? ((referenceStore[reference]) ?? undefined) : undefined;

    let label;
    if (selectedReferenceStore) label = selectedReferenceStore.value[filter.v.toString()]?.label;
    else label = filter.v.toString();
    return {
        key: keyMap[filter.k] || { label: filter.k, name: filter.k },
        value: { label, name: filter.v },
        operator: datetimeRawQueryOperatorToQueryTagOperatorMap[filter.o as string] || filter.o || '' as OperatorType,
    };
};
const filterToApiQueryFilter = (_filters: ConsoleFilter[], timezone = 'UTC') => {
    let filter: ApiFilter[] = [];
    const keyword: string[] = [];

    _filters.forEach((f) => {
        if (f.k) {
            let op: ConsoleFilterOperator;
            let value = f.v;
            /* null case */
            // TODO: remove checking string 'null' case. This is defense code for v1.10.4.2
            if (value === 'null' || value === null || value === undefined) {
                op = f.o?.startsWith('!') ? '!=' : '=';
                value = null;
            } else op = f.o ?? '';

            if (datetimeRawQueryOperatorToQueryTagOperatorMap[op]) {
                /* datetime case */
                const datetimeFilters = convertDatetimeQueryStoreFilterToFilters(f, timezone);
                if (datetimeFilters) filter = filter.concat(datetimeFilters);
            } else if (Array.isArray(value)) {
                // TODO: remove checking string 'null' case. This is defense code for v1.10.4.2
                if (f.k.startsWith('tags.')) {
                    value = value.map((d) => {
                        if (d === 'null') return null;
                        return d;
                    });
                }

                /* plural case */
                if (rawQueryOperatorToPluralApiQueryOperatorMap[op]) {
                    filter.push({ k: f.k, v: value, o: rawQueryOperatorToPluralApiQueryOperatorMap[op] as ApiFilterOperator });
                } else {
                    value.forEach((v) => {
                        filter.push({ k: f.k as string, v, o: rawQueryOperatorToApiQueryOperatorMap[op] });
                    });
                }
            } else {
                /* general case */
                filter.push({ k: f.k, v: value, o: rawQueryOperatorToApiQueryOperatorMap[op] });
            }
        } else if (f.v !== null && f.v !== undefined) {
            /* keyword case */
            if (Array.isArray(f.v)) keyword.push(...f.v.map((v) => (v !== null ? v.toString().trim() : '')));
            else keyword.push(f.v.toString().trim());
        }
    });
    return {
        filter,
        keyword,
    };
};

export class QueryHelper {
    private static timezone: any | undefined;

    private _referenceStore: ReferenceStore | undefined;

    private _keyMap: Record<string, KeyItem> = {};

    private _filters: ConsoleFilter[] = [];

    private _orFilters: ConsoleFilter[] = [];

    private _timezone: string | undefined;

    static init(timezone: any) {
        QueryHelper.timezone = timezone;
    }

    setTimezone(timezone: string|undefined): this {
        this._timezone = timezone;
        return this;
    }

    setReference(referenceStore?: ReferenceStore): this {
        this._referenceStore = referenceStore;
        return this;
    }

    setKeyItemSets(keyItemSets: KeyItemSet[]): this {
        this._keyMap = {};
        flatten(keyItemSets.map((d) => d.items)).forEach((d) => {
            this._keyMap[d.name] = d;
        });
        return this;
    }

    setFiltersAsQueryTag(queryTags: QueryTag[], keyItemSets?: KeyItemSet[]): this {
        if (keyItemSets) this.setKeyItemSets(keyItemSets);
        this._filters = [];
        const filterMap: any = {};
        queryTags.forEach((q) => {
            if (!q.invalid) {
                if (q.key && typeof q.key === 'object') {
                    const key = this._keyMap[q.key.name] || { ...q.key };

                    let op: ConsoleFilterOperator;
                    if (key.dataType === 'datetime') op = `${q.operator}t` as ConsoleFilterOperator;
                    else if (q.value.name === null || q.value.name === undefined) op = q.operator?.startsWith('!') ? '!=' : '=';
                    else op = q.operator ?? '' as ConsoleFilterOperator;

                    if (filterMap[key.name]) {
                        if (filterMap[key.name][op]) filterMap[key.name][op].push(q.value.name);
                        else filterMap[key.name][op] = [q.value.name];
                    } else {
                        filterMap[key.name] = { [op]: [q.value.name] };
                    }
                } else this._filters.push({ v: q.value.name });
            }
        });
        forEach(filterMap, (opMap, k) => {
            forEach(opMap, (v, o) => {
                this._filters.push({ k, v, o: o as ConsoleFilterOperator });
            });
        });
        // this._filters.push({
        //     k: key.name,
        //     v: q.value.name,
        //     o: op,
        // });
        return this;
    }

    setFiltersAsRawQuery(rawQueries: RawQuery[]): this {
        this._filters = rawQueries.map((q) => {
            const [v, k, o] = q;
            return { k, v, o };
        });
        return this;
    }

    setFiltersAsRawQueryString(rawQueryStrings: LocationQueryValue | LocationQueryValue[]): this {
        this._filters = [];
        if (Array.isArray(rawQueryStrings)) {
            rawQueryStrings.forEach((q) => {
                if (q) {
                    try {
                        const [v, k, o] = JSON.parse(q) as RawQuery;
                        this._filters.push({ k, v, o });
                    } catch (e) { console.error('QUERY HELPER - raw query string parsing error. input: ', rawQueryStrings, '\nerror: ', e); }
                }
            });
        } else if (rawQueryStrings) {
            try {
                const [v, k, o] = JSON.parse(rawQueryStrings) as RawQuery;
                this._filters.push({ k, v, o });
            } catch (e) { console.error('QUERY HELPER - raw query string parsing error. input: ', rawQueryStrings, '\nerror: ', e); }
        }
        return this;
    }

    setFilters(filters: ConsoleFilter[]): this {
        this._filters = [...filters];
        return this;
    }

    setOrFilters(orFilters: Required<ConsoleFilter>[]): this {
        orFilters.forEach((f) => {
            if (f.k === undefined || f.o === undefined || f.o === '') {
                throw new Error('QueryHelper: orFilter must have key and operator');
            }
        });
        this._orFilters = [...orFilters];
        return this;
    }

    addFilter(...filters: ConsoleFilter[]): this {
        this._filters.push(...filters);
        return this;
    }

    addOrFilter(...orFilters: Required<ConsoleFilter>[]): this {
        orFilters.forEach((f) => {
            if (f.k === undefined || f.o === undefined || f.o === '') {
                throw new Error('QueryHelper: orFilter must have key and operator');
            }
        });
        this._orFilters.push(...orFilters);
        return this;
    }

    get filters(): ConsoleFilter[] {
        return [...this._filters];
    }

    get orFilters(): ConsoleFilter[] {
        return [...this._orFilters];
    }

    get queryTags(): QueryTag[] {
        const res: QueryTag[] = [];
        this._filters.forEach((f) => {
            if (Array.isArray(f.v)) {
                f.v.forEach((v) => {
                    const tag = filterToQueryTag({ k: f.k, v, o: f.o }, this._keyMap, this._referenceStore);
                    if (tag) res.push(tag);
                });
            } else {
                const tag = filterToQueryTag(f as any, this._keyMap, this._referenceStore);
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
        return this.rawQueries.map((q) => JSON.stringify(q));
    }

    get rawQueryString(): string {
        return JSON.stringify(this.rawQueries);
    }

    get apiQuery() {
        const { filter, keyword } = filterToApiQueryFilter(this._filters, this._timezone ?? QueryHelper.timezone?.value);
        const { filter: filterOr } = filterToApiQueryFilter(this._orFilters, this._timezone ?? QueryHelper.timezone?.value);

        return {
            filter,
            filterOr,
            keyword: keyword.join(' ') || '',
        };
    }
}
