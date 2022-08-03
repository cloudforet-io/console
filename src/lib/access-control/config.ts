export const ACCESS_LEVEL = {
    EXCLUDE_AUTH: 0,
    AUTHENTICATED: 1,
    VIEW_PERMISSION: 2,
    MANAGE_PERMISSION: 3,
} as const;

export type AccessLevel = typeof ACCESS_LEVEL[keyof typeof ACCESS_LEVEL]
