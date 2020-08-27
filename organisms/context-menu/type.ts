export enum CONTEXT_MENU_TYPE {
    divider = 'divider',
    header = 'header',
    item = 'item',
    info = 'info',
}

export interface MenuItem {
    name?: string;
    label?: string;
    type: keyof typeof CONTEXT_MENU_TYPE;
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
