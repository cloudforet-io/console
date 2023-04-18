export const DIRECTION = {
    horizontal: 'horizontal',
    vertical: 'vertical',
} as const;

export type Direction = typeof DIRECTION[keyof typeof DIRECTION];
