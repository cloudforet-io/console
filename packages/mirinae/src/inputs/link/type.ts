export const IconPosition = {
    left: 'left',
    right: 'right',
} as const;
export type IconPosition = typeof IconPosition[keyof typeof IconPosition];

export const LinkSize = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;
export type LinkSize = typeof LinkSize[keyof typeof LinkSize];
