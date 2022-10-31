import type { MenuItem } from '@/inputs/context-menu/type';
import type { AutocompleteHandler } from '@/inputs/search/autocomplete-search/type';

export interface SearchProps {
    value: string; // sync
    placeholder?: string;
    disableIcon?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    isFocused?: boolean; // sync
    visibleMenu: boolean;
    useFixedMenuStyle: boolean;
    menu: MenuItem[];
    loading: boolean;
    handler?: AutocompleteHandler;
    disableHandler: boolean;
    useAutoComplete: boolean;
}

export interface InputListeners {
    input: any;
    blur: any;
    focus: any;
    keyup: any;
}
