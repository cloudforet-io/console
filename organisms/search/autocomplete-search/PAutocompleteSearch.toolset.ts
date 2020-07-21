import { MenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import Fuse, { FuseOptions } from 'fuse.js';

export const autocompleteSearchProps = {
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
    disableIcon: {
        type: Boolean,
        default: false,
    },
    menu: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    visibleMenu: {
        type: Boolean,
        default: undefined,
    },
    isFocused: {
        type: Boolean,
        default: undefined,
    },
};
export interface AutocompleteSearchState {
    placeholder: string;
    menu: MenuItem[];
    loading: boolean;
    focused: boolean;
}

export interface AutocompleteSearchSyncState {
    value: string;
    visibleMenu?: boolean;
    isFocused?: boolean;
}
export interface AutocompleteSearchProps extends AutocompleteSearchState, AutocompleteSearchSyncState {
}


export function plainAutocompleteHandler <T=any>(inputText: string, list: any[], key?: string): MenuItem[] {
    let res = list;
    if (inputText.trim()) {
        const options: FuseOptions<T> = {};
        if (key) options.keys = [key];
        const fuse = new Fuse(list, options);
        res = fuse.search(inputText);
    }

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
