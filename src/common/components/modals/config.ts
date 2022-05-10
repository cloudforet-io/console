export const SIZE = Object.freeze({
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const);

export type SIZE = typeof SIZE[keyof typeof SIZE];
