export const BUTTON_STYLE = {
    primary: 'primary',
    substitutive: 'substitutive',
    secondary: 'secondary',
    tertiary: 'tertiary',
    transparent: 'transparent',
    highlight: 'highlight',
    positive: 'positive',
    'negative-primary': 'negative-primary',
    'negative-secondary': 'negative-secondary',
    'negative-transparent': 'negative-transparent',
} as const;

export const BUTTON_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;

export type ButtonStyle = typeof BUTTON_STYLE[keyof typeof BUTTON_STYLE];
export type ButtonSize = typeof BUTTON_SIZE[keyof typeof BUTTON_SIZE];

export interface ButtonProps {
    href?: string;
    disabled?: boolean;
    readonly?: boolean;
    loading?: boolean;
    styleType?: ButtonStyle;
    size?: ButtonSize;
    block?: boolean;
    iconLeft?: string;
    iconRight?: string;
}
