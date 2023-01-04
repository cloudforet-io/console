import type { MenuItem } from '@/inputs/context-menu/type';

interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
}
export type AutocompleteHandler = (inputText: string, list: MenuItem[]) => Promise<HandlerRes>|HandlerRes;

export const FILTERABLE_DROPDOWN_TYPE = Object.freeze({
    default: 'default',
    radioButton: 'radioButton',
} as const);

export type FILTERABLE_DROPDOWN_TYPE = typeof FILTERABLE_DROPDOWN_TYPE[keyof typeof FILTERABLE_DROPDOWN_TYPE];

export type FilterableDropdownMenuItem = MenuItem;

export interface FilterableDropdownProps {
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
    selected?: FilterableDropdownMenuItem[];
    multiSelectable?: boolean;
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
    /* extra props */
    type?: FILTERABLE_DROPDOWN_TYPE;
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    exactMode?: boolean;
    strictSelectMode?: boolean;
    disableDeleteAll?: boolean;
}
