export const ACCESS_LEVEL = {
    EXCLUDE_AUTH: 0,
    AUTHENTICATED: 1,
    NO_PERMISSION: 2,
    VIEW_PERMISSION: 3,
    MANAGE_PERMISSION: 4,
} as const;

export type AccessLevel = typeof ACCESS_LEVEL[keyof typeof ACCESS_LEVEL]
