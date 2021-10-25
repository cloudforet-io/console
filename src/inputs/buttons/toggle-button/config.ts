export const TOGGLE_BUTTON_THEME = Object.freeze({
    secondary: 'secondary',
    peacock500: 'peacock500',
} as const);

export type TOGGLE_BUTTON_THEME = typeof TOGGLE_BUTTON_THEME[keyof typeof TOGGLE_BUTTON_THEME];
