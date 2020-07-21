import { ChangeTagCallBack, TagToolSet } from '@/components/molecules/tags/PTag.toolset';
import {
    computed, reactive, ref, Ref,
} from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { CONTEXT_MENU_TYPE, MenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import {
    FILTER_OPERATOR, OperatorType, Query,
} from '@/lib/fluent-api';
import { StatQueryAPI } from '@/lib/fluent-api/statistics/toolset';
import { debounce } from 'lodash';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';

export const querySearchProps = {
    value: {
        type: String,
        default: '',
        required: true,
    },
    placeholder: {
        type: String,
        default: 'Search',
    },
    focused: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    keyItems: {
        type: Array,
        default: () => [],
    },
    valueItems: {
        type: Array,
        default: () => [],
    },
};

export interface QuerySearchState {
    placeholder: string;
    loading: boolean;
    focused: boolean;
    keyItems: KeyItem[];
    valueItems: string[];
}
export interface QuerySearchSyncState {
    value: string;
}
export interface QuerySearchProps extends QuerySearchState, QuerySearchSyncState {
}

export enum QUERY_SEARCH_TYPE {
    string = 'string',
    boolean = 'boolean',
    date = 'date'
}

export interface KeyItem {
    name: string;
    label: string;
}

export interface QueryItem {
    key?: KeyItem;
    operator: OperatorType;
    value: string;
    // invalid?: boolean;
    // description?: string;
}

export type AutoCompleteHandler = (inputText: string, items: KeyItem[]|string[]) => KeyItem[]|string[];
export type KeyHandler = (inputText: string) => Promise<KeyItem[]>;
export type ValueHandler = (inputText: string, keyItem: KeyItem) => Promise<string[]>;


export const makeKeyItems = (keys: string[]): KeyItem[] => keys.map(d => ({ label: d, name: d }));

export function getKeyHandler(keys: string[]): KeyHandler {
    const keyItems = makeKeyItems(keys);

    return async (val: string) => {
        let res = keyItems;
        if (val) {
            res = keyItems.reduce((result, item) => {
                if (item.label.includes(val) || item.name.includes(val)) result.push(item);
                return result;
            }, [] as KeyItem[]);
        }

        return res;
    };
}

export function getEnumValueHandler(enums: string[]): ValueHandler {
    const items = makeKeyItems(enums);
    return async (val: string, keyItem: KeyItem) => items.reduce((result, item) => {
        if (item.label.includes(val)) result.push(item.label);
        return result;
    }, [] as string[]);
}


export interface ValueHandlerMap {
    [key: string]: ValueHandler;
}

export class QuerySearchToolSet extends TagToolSet<QueryTag> {
    state: QuerySearchState = reactive({
        keyItems: [],
        valueItems: [],
        placeholder: 'Search',
        loading: false,
        focused: true,
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
        this.state.valueItems = await this.valueHandlerMap[keyItem.name]('', keyItem);
    }

    onKeyInput = debounce(async (val: string) => {
        this.state.keyItems = await this.keyHandler(val);
    }, 200)

    onValueInput = debounce(async (val: string, keyItem: KeyItem) => {
        this.state.valueItems = await this.valueHandlerMap[keyItem.name](val, keyItem) || [];
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
