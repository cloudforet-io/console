import {
    KeyItem,
    QueryItem,
    QuerySearchProps,
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
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { reactive, ref, Ref } from '@vue/composition-api';
import {
    SearchEnumItem,
    SearchEnums,
    SearchKeyGroup,
} from '@/lib/component-utils/query-search/type';
import { fluentApi } from '@/lib/fluent-api';
import { getStatApiValueHandler } from '@/lib/api/query-search';
import { AutocompleteHandler } from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.toolset';


type KeyParam = Array<string[]|string>
export const makeKeyItems = (keys: KeyParam): KeyItem[] => keys.map((d) => {
    if (Array.isArray(d)) return { name: d[0], label: d[1] || d[0] };
    return { name: d, label: d };
});

export function getEnumValueHandler(keys: KeyParam): ValueHandler {
    const keyItems = makeKeyItems(keys);

    return async (val: string, keyItem: KeyItem) => {
        const res: ValueItem[] = [...keyItems];
        const regex = RegExp(val, 'i');

        if (val) {
            forEach(keyItems, (d) => {
                if ((regex.exec(d.label) || regex.exec(d.name))) res.push(d);
            });
        }

        return {
            results: res,
            totalCount: keyItems.length,
        };
    };
}

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

export function makeValueHandlerWithReference(resourceType: string, distinct?: string, limit?: number): ValueHandler {
    let api = fluentApi.addons().autocomplete().get()
        .setResourceType(resourceType)
        .setLimit(limit || 10);
    if (distinct) api = api.setDistinct(distinct);
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

export function makeValueHandlerMapWithReference(keys: KeyParam, resourceType: string): ValueHandlerMap {
    const res = {};
    keys.forEach((k) => {
        if (Array.isArray(k)) res[k[0]] = makeValueHandlerWithReference(resourceType, k[0]);
        else res[k] = makeValueHandlerWithReference(resourceType, k);
    });
    return res;
}

export function makeValueHandlerWithSearchEnums(
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
                if (regex.exec(d.label) || regex.exec(d.name)) result.push(d);
                return result;
            }, [] as ValueItem[]);
        }

        return {
            results: res,
            totalCount,
        };
    };
}

export function makeQuerySearchHandlersWithSearchSchema(schema: SearchKeyGroup, resourceType: string): Pick<QuerySearchProps, 'keyItems'|'valueHandlerMap'> {
    const res: Pick<QuerySearchProps, 'keyItems'|'valueHandlerMap'> = { keyItems: [], valueHandlerMap: {} };

    res.keyItems = schema.items.map(d => ({ label: d.name, name: d.key, dataType: d.data_type }));

    schema.items.forEach((d) => {
        if (d.enums) {
            res.valueHandlerMap[d.key] = makeValueHandlerWithSearchEnums(d.enums);
        } else {
            res.valueHandlerMap[d.key] = makeValueHandlerWithReference(
                d.reference || resourceType,
                d.reference ? d.key : undefined,
            );
        }
    });

    return res;
}


export class QuerySearchToolSet extends TagToolSet<QueryTag> {
    state: QuerySearchState = reactive({
        keyItems: [],
        placeholder: 'Search',
        focused: true,
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
        tags: Ref<any[]> = ref([]),
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
