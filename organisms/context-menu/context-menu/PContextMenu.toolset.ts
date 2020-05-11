export interface MenuItem {
    name: string;
    label: string;
    type: 'divider'|'header'|'item';
    disabled?: boolean;
}

export const contextMenuProps = {
    menu: {
        type: [Array, Object],
        default: () => [],
    },
    theme: {
        type: String,
        default: 'secondary',
        validator(theme) {
            return ['secondary', 'gray900'].includes(theme);
        },
    },
    loading: {
        type: Boolean,
        default: false,
    },
    autoHeight: {
        type: Boolean,
        default: false,
    },
};

export type ContextMenuTheme = 'secondary'|'gray900'

export interface ContextMenuProps {
    menu: MenuItem[];
    theme: ContextMenuTheme;
    loading: boolean;
    autoHeight: boolean;
}
