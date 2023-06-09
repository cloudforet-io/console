export const POSITIONS = {
    top: 'top',
    'top-start': 'top-start',
    'top-end': 'top-end',
    right: 'right',
    'right-start': 'right-start',
    'right-end': 'right-end',
    bottom: 'bottom',
    'bottom-start': 'bottom-start',
    'bottom-end': 'bottom-end',
    left: 'left',
    'left-start': 'left-start',
    'left-end': 'left-end',
} as const;

export type TooltipPositions = typeof POSITIONS[keyof typeof POSITIONS];
