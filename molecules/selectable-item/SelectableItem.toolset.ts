export const selectableItemProps = {
    iconUrl: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    active: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    defaultIcon: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '',
    },
    theme: {
        type: String,
        default: 'default',
        validator(theme) {
            return ['default', 'card'].includes(theme);
        },
    },
};

export type ThemeType = 'default' | 'card';

export interface SelectableItemPropsType {
    iconUrl?: string;
    title?: string;
    active?: boolean;
    disabled?: boolean;
    defaultIcon?: string;
    color?: string;
    theme?: ThemeType;
}
