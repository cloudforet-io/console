import type { MenuItem } from '@/inputs/context-menu/type';

export type FilterableDropdownMenuItem = MenuItem;

interface HandlerRes {
    results: FilterableDropdownMenuItem[];
    totalCount?: number;
    more?: boolean;
}
export interface AutocompleteHandler {
    (inputText: string, pageStart?: number, pageLimit?: number): Promise<HandlerRes>|HandlerRes;
}

export const FILTERABLE_DROPDOWN_APPEARANCE_TYPES = ['basic', 'stack', 'badge'] as const;
export const FILTERABLE_DROPDOWN_STYLE_TYPES = ['basic', 'rounded'] as const;


export type FilterableDropdownAppearanceType = typeof FILTERABLE_DROPDOWN_APPEARANCE_TYPES[number];
export type FilterableDropdownStyleType = typeof FILTERABLE_DROPDOWN_STYLE_TYPES[number];
