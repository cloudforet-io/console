import { TranslateResult } from 'vue-i18n';

export enum CONTEXT_MENU_TYPE {
    divider = 'divider',
    header = 'header',
    item = 'item',
    info = 'info',
}

export const menuTypes = ['divider', 'header', 'item', 'info'] as const;

export type ContextMenuType = typeof menuTypes[number];

export interface MenuItem {
    name?: string;
    label?: string | TranslateResult;
    type: ContextMenuType;// keyof typeof CONTEXT_MENU_TYPE;
    disabled?: boolean;
    link?: string;
    target?: string;
}

export enum CONTEXT_MENU_THEME {
    secondary = 'secondary',
    gray900 = 'gray900',
    white = 'white',
}

export interface ContextMenuProps {
    menu: MenuItem[];
    theme: keyof typeof CONTEXT_MENU_THEME;
    loading: boolean;
    autoHeight: boolean;
}
