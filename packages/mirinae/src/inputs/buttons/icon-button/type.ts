export const ICON_BUTTON_STYLE_TYPE = {
    tertiary: 'tertiary',
    transparent: 'transparent',
    'negative-secondary': 'negative-secondary',
    'negative-transparent': 'negative-transparent',
} as const;
export type IconButtonStyleType = typeof ICON_BUTTON_STYLE_TYPE[keyof typeof ICON_BUTTON_STYLE_TYPE];

export const ICON_BUTTON_SHAPE = {
    circle: 'circle',
    square: 'square',
} as const;
export type IconButtonShape = typeof ICON_BUTTON_SHAPE[keyof typeof ICON_BUTTON_SHAPE];

export const ICON_BUTTON_SIZE = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
} as const;
export type IconButtonSize = keyof typeof ICON_BUTTON_SIZE;

export interface IconButtonProps {
    name: string;
    loading: boolean;
    styleType: IconButtonStyleType;
    color: string;
    disabled: boolean;
    activated: boolean;
    size: IconButtonSize;
    animation?: boolean;
    shape: IconButtonShape;
}
