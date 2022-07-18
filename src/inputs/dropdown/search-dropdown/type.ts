import type { ContextMenuFixedStyleProps } from '@/hooks/context-menu-fixed-style';
import type { MenuItem } from '@/inputs/context-menu/type';

interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
}
export type AutocompleteHandler = (inputText: string, list: MenuItem[]) => Promise<HandlerRes>|HandlerRes

export const SEARCH_DROPDOWN_TYPE = Object.freeze({
    default: 'default',
    radioButton: 'radioButton',
} as const);

export type SEARCH_DROPDOWN_TYPE = typeof SEARCH_DROPDOWN_TYPE[keyof typeof SEARCH_DROPDOWN_TYPE];

export type SearchDropdownMenuItem = MenuItem;

export interface SearchDropdownProps extends ContextMenuFixedStyleProps {
    /* search props */
    value: string;
    placeholder?: string;
    isFocused?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    /* context menu props */
    menu: MenuItem[];
    loading?: boolean;
    selected?: SearchDropdownMenuItem[];
    multiSelectable?: boolean;
    /* extra props */
    type?: SEARCH_DROPDOWN_TYPE;
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    exactMode?: boolean;
    strictSelectMode?: boolean;
    disableDeleteAll?: boolean;
}
