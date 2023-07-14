import type { TranslateResult } from 'vue-i18n';

export const CONTEXT_MENU_TYPE = {
    divider: 'divider',
    header: 'header',
    item: 'item',
    button: 'button',
    showMore: 'showMore',
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
    iconColor?: string;
    error?: boolean;
    imageUrl?: string;
}
