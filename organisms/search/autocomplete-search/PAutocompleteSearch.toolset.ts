import { CONTEXT_MENU_TYPE, MenuItem } from '@/components/organisms/context-menu/context-menu/PContextMenu.toolset';
import { ACFunction } from '@/components/organisms/search/query-search-bar/type';
import { get } from 'lodash';
import Fuse, { FuseOptions, FuseResultWithScore } from 'fuse.js';

export const autocompleteSearchProps = {
    searchText: {
        type: String,
        default: '',
        required: true,
    },
    searchPlaceholder: {
        type: String,
        default: '',
    },
    searchFocused: {
        type: Boolean,
        default: undefined,
    },
    menu: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
};
export interface AutocompleteSearchState {
    searchPlaceholder: string;
    menu: MenuItem[];
    loading: boolean;
}

export interface AutocompleteSearchSyncState {
    searchText: string;
    searchFocused?: boolean;
}
export interface AutocompleteSearchProps extends AutocompleteSearchState, AutocompleteSearchSyncState {
}


export function plainAutocompleteHandler <T=any>(inputText: string, list: any[], key?: string): MenuItem[] {
    const options: FuseOptions<T> = {};
    if (key) options.keys = [key];
    const fuse = new Fuse(list, options);
    const res = fuse.search(inputText);
    console.debug('res', res);
    // @ts-ignore
    return res.map((d) => {
        const value = key ? d[key] : d;
        return {
            type: 'item',
            label: value,
            name: value,
        };
    });
}
