export const POPOVER_PLACEMENT = Object.freeze({
    BOTTOM_START: 'bottom-start',
    BOTTOM_END: 'bottom-end',
    BOTTOM: 'bottom',
    TOP_START: 'top-start',
    TOP_END: 'top-end',
    TOP: 'top',
    LEFT_START: 'left-start',
    LEFT_END: 'left-end',
    LEFT: 'left',
    RIGHT_START: 'right-start',
    RIGHT_END: 'right-end',
    RIGHT: 'right',
} as const);

export type POPOVER_PLACEMENT = typeof POPOVER_PLACEMENT[keyof typeof POPOVER_PLACEMENT];
