export const TOGGLE_BUTTON_THEME = {
    secondary: 'secondary',
    peacock500: 'peacock500',
} as const;

export const TOGGLE_BUTTON_SPACING = {
    none: 'none',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    spaceBetween: 'space-between',
} as const;

export const TOGGLE_BUTTON_POSITION = {
    right: 'right',
    left: 'left',
    top: 'top',
} as const;

export type TOGGLE_BUTTON_THEME = typeof TOGGLE_BUTTON_THEME[keyof typeof TOGGLE_BUTTON_THEME];
