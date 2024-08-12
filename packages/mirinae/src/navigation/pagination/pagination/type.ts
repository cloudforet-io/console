
export const PAGINATION_SIZE = {
    sm: 'sm',
    md: 'md',
} as const;
export type PaginationSize = typeof PAGINATION_SIZE[keyof typeof PAGINATION_SIZE];

