export const COLLAPSIBLE_LIST_TOGGLE_POSITION = Object.freeze({
    title: 'title',
    contents: 'contents',
} as const);

export type COLLAPSIBLE_LIST_TOGGLE_POSITION = typeof COLLAPSIBLE_LIST_TOGGLE_POSITION[keyof typeof COLLAPSIBLE_LIST_TOGGLE_POSITION];

export const COLLAPSIBLE_LIST_THEME = Object.freeze({
    card: 'card',
    plain: 'plain',
} as const);

export type COLLAPSIBLE_LIST_THEME = typeof COLLAPSIBLE_LIST_THEME[keyof typeof COLLAPSIBLE_LIST_THEME];
