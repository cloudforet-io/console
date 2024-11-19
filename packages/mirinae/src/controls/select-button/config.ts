export const SELECT_BUTTON_LAYOUT_TYPE = {
    ICON_ONLY: 'icon-only',
    TEXT_ONLY: 'text-only',
} as const;

export type SelectButtonLayoutType = typeof SELECT_BUTTON_LAYOUT_TYPE[keyof typeof SELECT_BUTTON_LAYOUT_TYPE];

export const SELECT_BUTTON_STYLE_TYPE = {
    secondary: 'secondary',
    gray: 'gray',
} as const;
export type SelectButtonStyleType = typeof SELECT_BUTTON_STYLE_TYPE[keyof typeof SELECT_BUTTON_STYLE_TYPE];

export const SELECT_BUTTON_SIZE = {
    md: 'md',
    sm: 'sm',
} as const;

export type SelectButtonSize = typeof SELECT_BUTTON_SIZE[keyof typeof SELECT_BUTTON_SIZE];
