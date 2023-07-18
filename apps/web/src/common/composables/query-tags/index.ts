import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilterOperator, ConsoleFilterValue, ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { QueryTag } from '@spaceone/design-system/types/inputs/search/query-search-tags/type';
import type {
    KeyItem as MirinaeKeyItem,
    OperatorType,
} from '@spaceone/design-system/types/inputs/search/query-search/type';
import { flatten, forEach } from 'lodash';
import type { ComputedRef, Ref } from 'vue';
import { computed, isRef, reactive } from 'vue';


import type { ReferenceMap } from '@/store/modules/reference/type';

interface KeyItem extends MirinaeKeyItem {
    reference?: string;
}
interface KeyItemSet {
    title: string;
    items: KeyItem[];
}
type KeyMap = Record<string, KeyItem>;
type ReferenceStore = Record<string, ComputedRef<ReferenceMap>>;
const datetimeOperatorToOriginMap: Partial<Record<ConsoleFilterOperator, OperatorType>> = {
    '>t': '>',
    '>=t': '>=',
    '<t': '<',
    '<=t': '<=',
    '=t': '=',
};
const filterToQueryTag = (
    filter: { k?: string; v: ConsoleFilterValue; o?: ConsoleFilterOperator },
    keyMap: KeyMap,
    referenceStore?: ReferenceStore,
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
    if (datetimeOperatorToOriginMap[filter.o as string]) {
        /* datetime case */
        const key = keyMap[filter.k] || { label: filter.k, name: filter.k };
        key.dataType = 'datetime';
        return {
            key,
            value: { label: filter.v.toString(), name: filter.v },
            operator: datetimeOperatorToOriginMap[filter.o as string],
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
        operator: datetimeOperatorToOriginMap[filter.o as string] || filter.o || '' as OperatorType,
    };
};

interface Options {
    keyItemSets?: KeyItemSet[]|Ref<KeyItemSet[]>|ComputedRef<KeyItemSet[]>;
    referenceStore?: Record<string, ComputedRef<ReferenceMap>>;
}
export const useQueryTags = ({ keyItemSets, referenceStore }: Options) => {
    let keyMap: KeyMap = {};

    const applyKeyItemSetsToKeyMap = (_keyItemSets: KeyItemSet[] = []) => {
        keyMap = {};
        flatten(_keyItemSets.map((d) => d.items)).forEach((d) => {
            keyMap[d.name] = d;
        });
    };

    applyKeyItemSetsToKeyMap(isRef(keyItemSets) ? keyItemSets.value : keyItemSets);

    const state = reactive({
        keyItemSets,
        filters: [] as ConsoleFilter[],
        queryTags: [] as QueryTag[],
    });

    const setKeyItemSets = (_keyItemSets: KeyItemSet[]) => {
        applyKeyItemSetsToKeyMap(_keyItemSets);
        state.keyItemSets = _keyItemSets;
    };

    const setFilters = (filters: ConsoleFilter[]) => {
        const tags: QueryTag[] = [];
        filters.forEach((f) => {
            if (Array.isArray(f.v)) {
                f.v.forEach((v) => {
                    const tag = filterToQueryTag({ k: f.k, v, o: f.o }, keyMap, referenceStore);
                    if (tag) tags.push(tag);
                });
            } else {
                const tag = filterToQueryTag(f as any, keyMap, referenceStore);
                if (tag) tags.push(tag);
            }
        });
        state.filters = filters;
        state.queryTags = tags;
    };

    const setQueryTags = (queryTags: QueryTag[], _keyItemSets?: KeyItemSet[]) => {
        if (_keyItemSets) setKeyItemSets(_keyItemSets);
        const filters: ConsoleFilter[] = [];
        const filtersMap: any = {};
        queryTags.forEach((q) => {
            if (!q.invalid) {
                if (q.key && typeof q.key === 'object') {
                    const key = keyMap[q.key.name] || { ...q.key };

                    let op: ConsoleFilterOperator;
                    if (key.dataType === 'datetime') op = `${q.operator}t` as ConsoleFilterOperator;
                    else if (q.value.name === null || q.value.name === undefined) op = q.operator?.startsWith('!') ? '!=' : '=';
                    else op = q.operator ?? '' as ConsoleFilterOperator;

                    if (filtersMap[key.name]) {
                        if (filtersMap[key.name][op]) filtersMap[key.name][op].push(q.value.name);
                        else filtersMap[key.name][op] = [q.value.name];
                    } else {
                        filtersMap[key.name] = { [op]: [q.value.name] };
                    }
                } else filters.push({ v: q.value.name });
            }
        });
        forEach(filtersMap, (opMap, k) => {
            forEach(opMap, (v, o) => {
                filters.push({ k, v, o: o as ConsoleFilterOperator });
            });
        });
        state.filters = filters;
        state.queryTags = queryTags;
    };

    const queryHelper = new QueryHelper();
    const setURLQueryStringFilters = (rawQueryStrings: undefined|string|(string|null)[]) => {
        queryHelper.setFiltersAsRawQueryString(rawQueryStrings);
        setFilters(queryHelper.filters);
    };


    const getFilters = () => state.filters;

    const getQueryTags = () => state.queryTags;

    const getURLQueryStringFilters = () => queryHelper.setFilters(state.filters).rawQueryStrings;

    return {
        keyItemSets: computed(() => state.keyItemSets),
        filters: computed<ConsoleFilter[]>(() => state.filters),
        queryTags: computed<QueryTag[]>(() => state.queryTags),
        urlQueryStringFilters: computed<string>(() => ''),
        setKeyItemSets,
        setFilters,
        getFilters,
        setQueryTags,
        getQueryTags,
        setURLQueryStringFilters,
        getURLQueryStringFilters,
    };
};
