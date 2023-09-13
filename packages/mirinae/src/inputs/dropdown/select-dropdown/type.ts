import type { MenuItem } from '@/inputs/context-menu/type';

export type SelectDropdownMenuItem = MenuItem;

export const CONTEXT_MENU_POSITION = {
    LEFT: 'left',
    RIGHT: 'right',
} as const;

export const SELECT_DROPDOWN_STYLE_TYPE = {
    DEFAULT: 'default',
    ROUNDED: 'rounded',
    TRANSPARENT: 'transparent',
    ICON_BUTTON: 'icon-button',
} as const;

export const SELECT_DROPDOWN_APPEARANCE_TYPE = {
    BASIC: 'basic',
    STACK: 'stack',
    BADGE: 'badge',
} as const;


export type ContextMenuPosition = typeof CONTEXT_MENU_POSITION[keyof typeof CONTEXT_MENU_POSITION];
export type SelectDropdownStyleType = typeof SELECT_DROPDOWN_STYLE_TYPE[keyof typeof SELECT_DROPDOWN_STYLE_TYPE];
export type SelectDropdownAppearanceType = typeof SELECT_DROPDOWN_APPEARANCE_TYPE[keyof typeof SELECT_DROPDOWN_APPEARANCE_TYPE];

interface HandlerRes {
    results: SelectDropdownMenuItem[];
    totalCount?: number;
    more?: boolean;
}
export interface AutocompleteHandler {
    (inputText: string, pageStart?: number, pageLimit?: number): Promise<HandlerRes>|HandlerRes;
}
