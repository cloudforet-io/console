import type { MenuItem } from '@/inputs/context-menu/type';

export const CONTEXT_MENU_POSITION = Object.freeze({
    LEFT: 'left',
    RIGHT: 'right',
} as const);

export const SELECT_DROPDOWN_STYLE_TYPE = Object.freeze({
    DEFAULT: 'default',
    ICON_BUTTON: 'icon-button',
    TRANSPARENT: 'transparent',
    SECONDARY_BUTTON: 'secondary-button',
} as const);

export const SELECT_DROPDOWN_SIZE = {
    md: 'md',
    lg: 'lg',
} as const;

export type CONTEXT_MENU_POSITION = typeof CONTEXT_MENU_POSITION[keyof typeof CONTEXT_MENU_POSITION];
export type SELECT_DROPDOWN_STYLE_TYPE = typeof SELECT_DROPDOWN_STYLE_TYPE[keyof typeof SELECT_DROPDOWN_STYLE_TYPE];
export type SelectDropdownSize = typeof SELECT_DROPDOWN_SIZE[keyof typeof SELECT_DROPDOWN_SIZE];

export type SelectDropdownMenu = MenuItem;

export interface SelectDropdownProps {
    items?: SelectDropdownMenu[];
    selected?: string | number;
    invalid?: boolean;
    disabled?: boolean;
    loading?: boolean;
    indexMode?: boolean;
    placeholder?: string;
    styleType?: SELECT_DROPDOWN_STYLE_TYPE;
    buttonIcon?: string;
    readOnly?: boolean;
    // context menu fixed style props
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
    size?: SelectDropdownSize;
}
