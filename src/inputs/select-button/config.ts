export const SELECT_BUTTON_STYLE_TYPE = {
    secondary: 'secondary',
    gray: 'gray',
} as const;
export type SELECT_BUTTON_STYLE_TYPE = typeof SELECT_BUTTON_STYLE_TYPE[keyof typeof SELECT_BUTTON_STYLE_TYPE];

export const SELECT_BUTTON_SIZE = {
    md: 'md',
    sm: 'sm',
} as const;

export type SELECT_BUTTON_SIZE = typeof SELECT_BUTTON_SIZE[keyof typeof SELECT_BUTTON_SIZE];
