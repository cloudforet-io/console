export const IconPosition = {
    left: 'left',
    right: 'right',
} as const;
export type IconPosition = typeof IconPosition[keyof typeof IconPosition];

export const AnchorSize = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;
export type AnchorSize = typeof AnchorSize[keyof typeof AnchorSize];
