export const PROGRESS_BAR_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;
export type PROGRESS_BAR_SIZE = typeof PROGRESS_BAR_SIZE[keyof typeof PROGRESS_BAR_SIZE];
