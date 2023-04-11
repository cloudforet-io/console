export const CARD_STYLE_TYPE = {
    gray100: 'gray100',
    yellow100: 'yellow100',
    yellow500: 'yellow500',
    indigo400: 'indigo400',
    red400: 'red400',
    white: 'white',
} as const;
export type CARD_STYLE_TYPE = typeof CARD_STYLE_TYPE[keyof typeof CARD_STYLE_TYPE];

export const CARD_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;
export type CARD_SIZE = typeof CARD_SIZE[keyof typeof CARD_SIZE];
