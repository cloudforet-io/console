import { TranslateResult } from 'vue-i18n';

export const CONTEXT_MENU_TYPE = {
    divider: 'divider',
    header: 'header',
    item: 'item',
    info: 'info',
} as const;

export type CONTEXT_MENU_TYPE = typeof CONTEXT_MENU_TYPE[keyof typeof CONTEXT_MENU_TYPE];

export interface MenuItem {
    name?: string;
    label?: string | TranslateResult;
    type?: CONTEXT_MENU_TYPE;
    disabled?: boolean;
    link?: string;
    target?: string;
}

export const CONTEXT_MENU_THEME = {
    secondary: 'secondary',
    gray900: 'gray900',
} as const;
export type CONTEXT_MENU_THEME = typeof CONTEXT_MENU_THEME[keyof typeof CONTEXT_MENU_THEME];


export interface ContextMenuProps {
    menu: MenuItem[];
    theme?: keyof typeof CONTEXT_MENU_THEME;
    loading?: boolean;
    alwaysShowMenu?: boolean;
    invalid?: boolean;
}
