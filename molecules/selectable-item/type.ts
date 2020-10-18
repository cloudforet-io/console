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
