import type { MenuAttachHandler, MenuAttachHandlerRes } from '@/hooks/context-menu-controller/context-menu-attach';
import type { MenuItem } from '@/inputs/context-menu/type';

export interface SelectDropdownMenuItem extends MenuItem {
    name: string;
}

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
    MASKING: 'masking', // this is for resolving a type error in JsonSchemaForm
} as const;


export type ContextMenuPosition = typeof CONTEXT_MENU_POSITION[keyof typeof CONTEXT_MENU_POSITION];
export type SelectDropdownStyleType = typeof SELECT_DROPDOWN_STYLE_TYPE[keyof typeof SELECT_DROPDOWN_STYLE_TYPE];
export type SelectDropdownAppearanceType = typeof SELECT_DROPDOWN_APPEARANCE_TYPE[keyof typeof SELECT_DROPDOWN_APPEARANCE_TYPE];

export type HandlerRes = MenuAttachHandlerRes<SelectDropdownMenuItem>;
export type AutocompleteHandler = MenuAttachHandler<SelectDropdownMenuItem>;
