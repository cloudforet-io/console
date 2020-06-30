import {
    autocompleteSearchProps,
    AutocompleteSearchState, AutocompleteSearchSyncState,
} from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.toolset';
import { MenuItem } from '@/components/organisms/context-menu/context-menu/PContextMenu.toolset';
import Fuse, { FuseOptions } from 'fuse.js';

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
    contextItems: {
        type: Array,
        default: () => ([]),
    },
    items: {
        type: Array,
        default: () => [],
    },
};

export interface QuerySearchState {
    placeholder: string;
    loading: boolean;
    focused: boolean;
    contextItems: ContextItem[];
    items: string[];
}
export type QuerySearchSyncState = AutocompleteSearchSyncState
export interface QuerySearchProps extends QuerySearchState, QuerySearchSyncState {
}

export enum QUERY_SEARCH_TYPE {
    string = 'string',
    boolean = 'boolean',
    date = 'date'
}

export interface ContextItem {
    label: string; // match with user input
    name: string; // api key
    // icon?: string;
    // type?: QUERY_SEARCH_TYPE; // validate value only. default = string
    // operatorMap?: object; // validate operator only.
    //                      // it has default map.
    //                     // it indicates both list of operators and operator mapper.
}


export interface QueryItem {
    key?: ContextItem;
    operator: string;
    value: string;
    // invalid?: boolean;
    // description?: string;
}


export function keyHandler <T=any>(inputText: string, items: ContextItem[]): ContextItem[] {
    let res: any = items;
    if (inputText) {
        const fuse = new Fuse(items, { keys: ['label', 'name'] });
        res = fuse.search(inputText);
    }

    return res;
}

export function plainStringHandler <T=any>(inputText: string, items: string[]): string[] {
    let res: any = items;
    if (inputText) {
        res = items.reduce((result, d) => {
            if (d.includes(inputText)) result.push(d);
            return result;
        }, [] as string[]);
    }

    return res;
}
