import type { MenuItem } from '@/inputs/context-menu/type';


interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
}
export type AutocompleteHandler = (inputText: string, list: MenuItem[]) => Promise<HandlerRes>|HandlerRes;

export interface SearchProps {
    value: string; // sync
    placeholder?: string;
    disableIcon?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    isFocused?: boolean; // sync
    visibleMenu?: boolean;
    useFixedMenuStyle: boolean;
    menu: MenuItem[];
    loading: boolean;
    handler?: AutocompleteHandler;
    disableHandler: boolean;
    useAutoComplete: boolean;
}
