export const VIEWERS_TYPE = {
    ALL: 'ALL',
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
} as const;
export type ViewersType = typeof VIEWERS_TYPE[keyof typeof VIEWERS_TYPE];

export const SCOPE_TYPE = {
    ALL: 'ALL',
    DOMAIN: 'DOMAIN',
    PROJECT: 'PROJECT',
} as const;
export type ScopeType = typeof SCOPE_TYPE[keyof typeof SCOPE_TYPE];
