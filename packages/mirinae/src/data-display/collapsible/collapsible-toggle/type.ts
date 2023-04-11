export const COLLAPSIBLE_TOGGLE_TYPE = Object.freeze({
    text: 'text',
    switch: 'switch',
} as const);

export type COLLAPSIBLE_TOGGLE_TYPE = typeof COLLAPSIBLE_TOGGLE_TYPE[keyof typeof COLLAPSIBLE_TOGGLE_TYPE];

export interface CollapsibleToggleProps {
    isCollapsed?: boolean;
    type?: COLLAPSIBLE_TOGGLE_TYPE;
}
