export const SIZE = {
    sm: 'sm',
    md: 'md',
} as const;

export type Size = typeof SIZE[keyof typeof SIZE];
