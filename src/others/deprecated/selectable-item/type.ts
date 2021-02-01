import { themes } from '@/others/deprecated/selectable-item/config';

export type ThemeType = typeof themes[number];

export interface SelectableItemPropsType {
    iconUrl?: string;
    title?: string;
    active?: boolean;
    disabled?: boolean;
    defaultIcon?: string;
    color?: string;
    theme?: ThemeType;
    iconSize?: string;
}
