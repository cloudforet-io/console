import type { TranslateResult } from 'vue-i18n';

export const CONTEXT_MENU_TYPE = {
    divider: 'divider',
    header: 'header',
    item: 'item',
    button: 'button',
} as const;

export type ContextMenuType = typeof CONTEXT_MENU_TYPE[keyof typeof CONTEXT_MENU_TYPE];

export interface MenuItem {
    name?: string;
    label?: string | TranslateResult;
    type?: ContextMenuType;
    disabled?: boolean;
    link?: string;
    target?: string;
    icon?: string;
}

export interface ContextMenuProps {
    menu: MenuItem[];
    loading?: boolean;
    selected?: MenuItem[];
    multiSelectable?: boolean;
    showRadioIcon?: boolean;
    strictSelectMode?: boolean;
    itemHeightFixed?: boolean;
    highlightTerm?: string;
    noSelectIndication?: boolean;
}
