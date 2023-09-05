import type { MenuItem } from '@/inputs/context-menu/type';

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

export const APPEARANCE_TYPE = {
    DEFAULT: 'default-appearance',
    BADGE: 'badge',
    STACK: 'stack',
} as const;

export type CONTEXT_MENU_POSITION = typeof CONTEXT_MENU_POSITION[keyof typeof CONTEXT_MENU_POSITION];
export type SELECT_DROPDOWN_STYLE_TYPE = typeof SELECT_DROPDOWN_STYLE_TYPE[keyof typeof SELECT_DROPDOWN_STYLE_TYPE];
export type APPEARANCE_TYPE = typeof APPEARANCE_TYPE[keyof typeof APPEARANCE_TYPE];

export type SelectDropdownMenu = MenuItem;
