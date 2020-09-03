import {
    KeyDataType,
    KeyItem,
    QueryItem,
    QuerySearchState,
    QuerySearchSyncState,
    ValueHandler,
    ValueHandlerMap,
    ValueItem,
} from '@/components/organisms/search/query-search/type';
import {
    forEach, map, size,
} from 'lodash';
import { ChangeTagCallBack, TagToolSet } from '@/components/molecules/tags/PTag.toolset';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import { reactive, ref, Ref } from '@vue/composition-api';
import {
    SearchEnumItem,
    SearchEnums,
} from '@/lib/component-utils/query-search/type';
import { fluentApi } from '@/lib/fluent-api';
import { AutocompleteHandler } from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.toolset';

type KeyTuple = [string, string|undefined, KeyDataType|undefined] // name, label, dataType
type KeyParam = Array<KeyTuple | string | KeyItem>

/**
 * @name makeKeyItems
 * @description A helper function that returns KeyItem[] necessary for QuerySearch component.
 * @param keys
 */
export const makeKeyItems = (keys: KeyParam): KeyItem[] => keys.map((d) => {
    if (Array.isArray(d)) return { name: d[0], label: d[1] || d[0], dataType: d[2] };
    if (typeof d === 'string') return { name: d, label: d };
    return d;
});

// Do not use except in case of using PAutoCompleteSearch component
export function makeAutocompleteHandlerWithReference(resourceType: string, distinct?: string, limit?: number): AutocompleteHandler {
    let api = fluentApi.addons().autocomplete().get()
        .setResourceType(resourceType)
        .setLimit(limit || 10);
    if (distinct) api = api.setDistinct(distinct);
    return async (inputText: string) => {
        try {
            const res = await api.setSearch(inputText).execute();
            return {
                results: res.data.results.map(d => ({ label: d.name, name: d.key, type: 'item' })),
                totalCount: res.data.total_count,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
}

/**
 * @name makeDistinctValueHandler
 * @description A helper function that returns ValueHandler necessary for QuerySearch component.
 * @param resourceType
 * @param distinct
 * @param dataType
 * @param limit
 */
export function makeDistinctValueHandler(resourceType: string, distinct: string, dataType?: string, limit?: number): ValueHandler|undefined {
    if (['datetime', 'boolean'].includes(dataType || '')) return undefined;

    const api = fluentApi.addons().autocomplete().get()
        .setResourceType(resourceType)
        .setLimit(limit || 10)
        .setDistinct(distinct);
    return async (inputText: string) => {
        try {
            const res = await api.setSearch(inputText).execute();
            return {
                results: res.data.results.map(d => ({ label: d.name, name: d.key })),
                totalCount: res.data.total_count,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
}

/**
 * @name makeReferenceValueHandler
 * @description A helper function that returns ValueHandler necessary for QuerySearch component.
 *              resourceType parameter must be supported by reference autocomplete api.
 * @param resourceType
 * @param dataType
 * @param limit
 */
export function makeReferenceValueHandler(resourceType: string, dataType?: string, limit?: number): ValueHandler {
    const api = fluentApi.addons().autocomplete().get()
        .setResourceType(resourceType)
        .setLimit(limit || 10);
    return async (inputText: string) => {
        try {
            const res = await api.setSearch(inputText).execute();
            return {
                results: res.data.results.map(d => ({ label: d.name, name: d.key })),
                totalCount: res.data.total_count,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
}

/**
 * @name makeEnumValueHandler
 * @description A helper function that returns ValueHandler necessary for QuerySearch component.
 * @param enums
 */
export function makeEnumValueHandler(
    enums: SearchEnums,
): ValueHandler {
    const totalCount = size(enums);
    // @ts-ignore
    const allItems: ValueItem[] = map(enums, (d: SearchEnumItem|string, k: number|string) => {
        if (typeof d === 'string') {
            return { label: d, name: d };
        }
        return { label: d.label, name: k, icon: d.icon };
    });

    return async (inputText: string, keyItem: KeyItem) => {
        let res: ValueItem[] = [...allItems];
        if (inputText) {
            const regex = RegExp(inputText, 'i');
            res = allItems.reduce((result, d) => {
                if (regex.test(d.label) || regex.test(d.name)) result.push(d);
                return result;
            }, [] as ValueItem[]);
        }

        return {
            results: res,
            totalCount,
        };
    };
}

/**
 * @name makeDistinctValueHandlerMap
 * @description A helper function that returns valueHandlerMap necessary for QuerySearch component.
 *              It uses keys as distinct keys for each valueHandler.
 * @param keys
 * @param resourceType
 */
export function makeDistinctValueHandlerMap(keys: KeyParam, resourceType: string): ValueHandlerMap {
    const res = {};
    keys.forEach((k) => {
        if (Array.isArray(k)) {
            res[k[0]] = makeDistinctValueHandler(resourceType, k[0], k[2]);
        } else if (typeof k === 'string') res[k] = makeDistinctValueHandler(resourceType, k);
        else res[k.name] = makeDistinctValueHandler(resourceType, k.name, k.dataType);
    });
    return res;
}

// will be deprecated
export class QuerySearchToolSet extends TagToolSet<QueryTag> {
    state: QuerySearchState = reactive({
        keyItems: [],
        placeholder: 'Search',
        focused: false,
        valueHandlerMap: {},
    });

    syncState: QuerySearchSyncState = reactive({
        value: '',
    }) as unknown as QuerySearchSyncState

    valueHandlerMap: ValueHandlerMap;

    onSearch = async (query: QueryItem) => {
        this.addTag(query);
    }

    constructor(
        keyItems: KeyItem[],
        valueHandlerMap: ValueHandlerMap,
        tags: Ref<QueryTag[]> = ref([]),
        checkDuplicate = true,
        changeTagCallBack?: ChangeTagCallBack,
    ) {
        super(tags, checkDuplicate, changeTagCallBack);
        this.state.keyItems = keyItems;
        this.valueHandlerMap = valueHandlerMap;
    }

    addTag = (val: QueryItem) => {
        if (this.checkDuplicate && !this.validation(val)) return;
        this.tags.value = [...this.tags.value, val];
    };

    validation = (query: QueryItem): boolean => this.tags.value.every((tag) => {
        if (tag.key && query.key) {
            return (query.key.name !== tag.key.name
                || query.operator !== tag.operator
                || query.value !== tag.value);
        }
        if (!tag.key && !query.key) {
            return query.value.name !== tag.value.name;
        }
        return true;
    });
}
