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
    label?: string;
    type?: ContextMenuType;
    disabled?: boolean;
    link?: string;
    target?: string;
    icon?: string;
    error?: boolean;
    imageUrl?: string;
}
