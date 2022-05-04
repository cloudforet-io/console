import { TranslateResult } from 'vue-i18n';

export const CONTEXT_MENU_TYPE = {
    divider: 'divider',
    header: 'header',
    item: 'item',
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
