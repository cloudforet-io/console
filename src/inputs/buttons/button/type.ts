export const BUTTON_STYLE = Object.freeze({
    'primary-dark': 'primary-dark',
    primary: 'primary',
    primary1: 'primary1',
    primary2: 'primary2',
    'secondary-dark': 'secondary-dark',
    secondary: 'secondary',
    secondary1: 'secondary1',
    gray: 'gray',
    gray900: 'gray900',
    alert: 'alert',
    safe: 'safe',
    'gray-border': 'gray-border',
    transparent: 'transparent',
    // 'gray900-hover' = 'gray900-hover',
    // 'gray900-border' = 'gray900-border'
} as const);

export const BUTTON_SIZE = Object.freeze({
    sm: 'sm',
    md: 'md',
    lg: 'lg',
}as const);

export const BUTTON_FONT_WEIGHT = Object.freeze({
    normal: 'normal',
    bold: 'bold',
} as const);

export type ButtonStyle = typeof BUTTON_STYLE[keyof typeof BUTTON_STYLE];
export type ButtonSize = typeof BUTTON_SIZE[keyof typeof BUTTON_SIZE];
export type ButtonFontWeight = typeof BUTTON_FONT_WEIGHT[keyof typeof BUTTON_FONT_WEIGHT];

export interface ButtonProps {
    href?: string;
    disabled?: boolean;
    loading?: boolean;
    outline?: boolean;
    styleType?: ButtonStyle;
    size?: ButtonSize;
    block?: boolean;
    fontWeight?: ButtonFontWeight;
    icon?: string;
}
