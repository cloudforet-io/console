export const SEARCH_TYPES = {
    plain: 'plain',
    query: 'query',
} as const;

export type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];
