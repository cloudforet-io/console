export const SPINNER_STYLE_TYPE = {
    gray: 'gray',
    white: 'white',
} as const;

export type SpinnerStyleType = typeof SPINNER_STYLE_TYPE[keyof typeof SPINNER_STYLE_TYPE];

export const SPINNER_SIZE = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
} as const;

export type SpinnerSize = typeof SPINNER_SIZE[keyof typeof SPINNER_SIZE];
