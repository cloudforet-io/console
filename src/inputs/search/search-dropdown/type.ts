import { MenuItem } from '@/inputs/context-menu/type';
import { ContextMenuFixedStyleProps } from '@/hooks/context-menu-fixed-style';

interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
}
export type AutocompleteHandler = (inputText: string, list: MenuItem[]) => Promise<HandlerRes>|HandlerRes

export const SEARCH_DROPDOWN_TYPE = Object.freeze({
    default: 'default',
    radioButton: 'radioButton',
    checkbox: 'checkbox',
} as const);

export type SEARCH_DROPDOWN_TYPE = typeof SEARCH_DROPDOWN_TYPE[keyof typeof SEARCH_DROPDOWN_TYPE];

export interface SearchDropdownProps extends ContextMenuFixedStyleProps {
    /* search props */
    value: string;
    placeholder?: string;
    disableIcon?: boolean;
    isFocused?: boolean;
    /* context menu props */
    menu: MenuItem[];
    loading?: boolean;
    selected?: MenuItem[];
    showSelectedList?: boolean;
    /* extra props */
    type?: SEARCH_DROPDOWN_TYPE;
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    exactMode?: boolean;
    showTagBox?: boolean;
}
