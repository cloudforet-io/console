export const IconPosition = Object.freeze({
    left: 'left',
    right: 'right',
} as const);
export type IconPosition = typeof IconPosition[keyof typeof IconPosition];

export const AnchorSize = Object.freeze({
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const);
export type AnchorSize = typeof AnchorSize[keyof typeof AnchorSize]
