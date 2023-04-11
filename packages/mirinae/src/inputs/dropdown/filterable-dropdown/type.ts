import type { MenuItem } from '@/inputs/context-menu/type';

export type FilterableDropdownMenuItem = MenuItem;

export interface HandlerRes {
    results: FilterableDropdownMenuItem[];
    totalCount?: number;
    more?: boolean;
}
export interface AutocompleteHandler {
    (inputText: string, pageStart?: number, pageLimit?: number): Promise<HandlerRes>|HandlerRes;
}

export const FILTERABLE_DROPDOWN_TYPE = Object.freeze({
    default: 'default',
    radioButton: 'radioButton',
} as const);

export type FILTERABLE_DROPDOWN_TYPE = typeof FILTERABLE_DROPDOWN_TYPE[keyof typeof FILTERABLE_DROPDOWN_TYPE];

export const FILTERABLE_DROPDOWN_APPEARANCE_TYPES = ['basic', 'stack', 'badge'] as const;
export type FilterableDropdownAppearanceType = typeof FILTERABLE_DROPDOWN_APPEARANCE_TYPES[number];
