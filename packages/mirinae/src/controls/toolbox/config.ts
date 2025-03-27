export const SEARCH_TYPES = {
    plain: 'plain',
    query: 'query',
} as const;

export type SEARCH_TYPES = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];
