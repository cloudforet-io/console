import {
    KeyItem, QueryItem, QuerySearchState, QuerySearchSyncState, ValueItem,
} from '@/components/organisms/search/query-search/type';
import {
    debounce, forEach, map, size,
} from 'lodash';
import { ChangeTagCallBack, TagToolSet } from '@/components/molecules/tags/PTag.toolset';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { reactive, ref, Ref } from '@vue/composition-api';
import {
    KeyHandler,
    SearchAutocompleteHelper,
    SearchEnumItem,
    SearchEnums,
    SearchKeyGroup,
    SearchKeyOptions,
    ValueHandler,
    ValueHandlerMap,
} from '@/lib/component-utils/query-search/type';
import { fluentApi } from '@/lib/fluent-api';


type KeyParam = Array<string[]|string>
export const makeKeyItems = (keys: KeyParam): KeyItem[] => keys.map((d) => {
    if (Array.isArray(d)) return { name: d[0], label: d[1] || d[0] };
    return { name: d, label: d };
});

export function getKeyHandler(keys: KeyParam): KeyHandler {
    const keyItems = makeKeyItems(keys);

    return async (val: string) => {
        let res = keyItems;
        if (val) {
            res = keyItems.reduce((result, item) => {
                if (item.label.includes(val) || item.name.includes(val)) result.push(item);
                return result;
            }, [] as KeyItem[]);
        }

        return {
            results: res,
            totalCount: keys.length,
        };
    };
}

export function getEnumValueHandler(enums: string[]): ValueHandler {
    return async (val: string, keyItem: KeyItem) => {
        const res: ValueItem[] = [];
        forEach(enums, (enumItem) => {
            if (typeof enumItem === 'string' && enumItem.includes(val)) res.push({ label: enumItem, name: enumItem });
        });
        return {
            results: res,
            totalCount: enums.length,
        };
    };
}
export const defaultSearchAutocompleteHelper: SearchAutocompleteHelper = Object.freeze({
    keyHandler: async text => ({
        results: [],
        totalCount: 0,
    }),
    valueHandlerMap: {},
    suggestKeys: [],
});

export function makeKeyHandlerWithSearchKeyOptions(keyOptions: SearchKeyOptions[]): KeyHandler {
    const allItems = keyOptions.map(d => ({ label: d.name, name: d.key, dataType: d.data_type }));

    return async (val: string) => {
        let keyItems: KeyItem[] = allItems;

        if (val) {
            const regex = RegExp(val, 'i');
            keyItems = keyOptions.reduce((result, d) => {
                if (regex.exec(d.name) || regex.exec(d.key)) {
                    result.push({
                        label: d.name, name: d.key, dataType: d.data_type,
                    });
                }
                return result;
            }, [] as KeyItem[]);
        }

        return {
            results: keyItems,
            totalCount: keyOptions.length,
        };
    };
}

export function makeValueHandlerWithReference(resourceType: string): ValueHandler {
    const api = fluentApi.addons().autocomplete().get().setResourceType(resourceType);
    return async (inputText: string, keyItem: KeyItem) => {
        try {
            const res = await api.setSearch(inputText).execute();
            return {
                results: res.data.results.map(d => ({ label: d.name, name: d.id })),
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
        let res: ValueItem[] = allItems;

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

export function makeQuerySearchHandlersWithSearchSchema(schema: SearchKeyGroup, resourceType: string): SearchAutocompleteHelper {
    const res = { ...defaultSearchAutocompleteHelper };

    res.keyHandler = makeKeyHandlerWithSearchKeyOptions(schema.items);

    schema.items.forEach((d) => {
        if (d.enums) {
            res.valueHandlerMap[d.key] = makeValueHandlerWithSearchEnums(d.enums);
        } else {
            res.valueHandlerMap[d.key] = makeValueHandlerWithReference(d.reference || resourceType);
        }
    });

    res.suggestKeys = schema.items.map(d => d.key);

    return res;
}


export class QuerySearchToolSet extends TagToolSet<QueryTag> {
    state: QuerySearchState = reactive({
        keyItems: [],
        valueItems: [],
        placeholder: 'Search',
        loading: false,
        focused: true,
        totalCount: 0,
    });

    syncState: QuerySearchSyncState = reactive({
        value: '',
    }) as unknown as QuerySearchSyncState

    keyHandler: KeyHandler;

    valueHandlerMap: ValueHandlerMap;

    suggestKeys: string[];

    onMenuShow = async (val: string, keyItem?: KeyItem) => {
        if (keyItem) await this.onValueInput(val, keyItem);
        else await this.onKeyInput(val);
    }

    onKeySelect = async (keyItem: KeyItem) => {
        const res = await this.valueHandlerMap[keyItem.name]('', keyItem);
        this.state.valueItems = res.results;
        this.state.totalCount = res.totalCount;
    }

    onKeyInput = debounce(async (val: string) => {
        const res = await this.keyHandler(val);
        this.state.keyItems = res.results;
        this.state.totalCount = res.totalCount;
    }, 200)

    onValueInput = debounce(async (val: string, keyItem: KeyItem) => {
        const res = await this.valueHandlerMap[keyItem.name](val, keyItem) || [];
        this.state.valueItems = res.results;
        this.state.totalCount = res.totalCount;
    }, 200)

    onSearch = async (query: QueryItem) => {
        this.addTag(query);
    }

    constructor(
        keyHandler: KeyHandler,
        valueHandlerMap: ValueHandlerMap,
        suggestKeys: string[],
        tags: Ref<any[]> = ref([]),
        checkDuplicate = true,
        changeTagCallBack?: ChangeTagCallBack,
    ) {
        super(tags, checkDuplicate, changeTagCallBack);
        this.keyHandler = keyHandler;
        this.valueHandlerMap = valueHandlerMap;
        this.suggestKeys = suggestKeys;
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
            return query.value !== tag.value;
        }
        return true;
    });
}
