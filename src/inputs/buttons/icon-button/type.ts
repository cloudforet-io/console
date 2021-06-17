export const ICON_BUTTON_STYLE_TYPE = {
    primary: 'primary',
    'primary-dark': 'primary-dark',
    primary1: 'primary1',
    primary2: 'primary2',
    secondary: 'secondary',
    secondary1: 'secondary1',
    gray: 'gray',
    gray900: 'gray900',
    alert: 'alert',
    safe: 'safe',
    transparent: 'transparent',
    'gray-border': 'gray-border',
} as const;
export type ICON_BUTTON_STYLE_TYPE = typeof ICON_BUTTON_STYLE_TYPE[keyof typeof ICON_BUTTON_STYLE_TYPE]

export const ICON_BUTTON_SHAPE = {
    circle: 'circle',
    square: 'square',
} as const;
export type ICON_BUTTON_SHAPE = typeof ICON_BUTTON_SHAPE[keyof typeof ICON_BUTTON_SHAPE];

export const ICON_BUTTON_SIZE = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
} as const;
export type ICON_BUTTON_SIZE = typeof ICON_BUTTON_SIZE[keyof typeof ICON_BUTTON_SIZE]

export interface IconButtonProps {
    name: string;
    loading: boolean;
    styleType: ICON_BUTTON_STYLE_TYPE;
    color: string;
    disabled: boolean;
    activated: boolean;
    outline: boolean;
    size: ICON_BUTTON_SIZE;
    shape: ICON_BUTTON_SHAPE;
}
