import { MenuItem } from '@/inputs/context-menu/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const CONTEXT_MENU_POSITION = Object.freeze({
    LEFT: 'left',
    RIGHT: 'right',
} as const);

export const SELECT_DROPDOWN_TYPE = Object.freeze({
    DEFAULT: 'default',
    BUTTON: 'button',
    OUTLINE_BUTTON: 'outline-button',
    ICON_BUTTON: 'icon-button',
} as const);

export type CONTEXT_MENU_POSITION = typeof CONTEXT_MENU_POSITION[keyof typeof CONTEXT_MENU_POSITION];
export type SELECT_DROPDOWN_TYPE = typeof SELECT_DROPDOWN_TYPE[keyof typeof SELECT_DROPDOWN_TYPE];

export type SelectDropdownMenu = MenuItem;

export interface SelectDropdownProps {
    items?: SelectDropdownMenu[];
    selected?: string | number;
    invalid?: boolean;
    disabled?: boolean;
    loading?: boolean;
    indexMode?: boolean;
    placeholder?: string;
    type?: SELECT_DROPDOWN_TYPE;
    buttonStyleType?: BUTTON_STYLE;
    buttonIcon?: string;
    // context menu fixed style props
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
}
