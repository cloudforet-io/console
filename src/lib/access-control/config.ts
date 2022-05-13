export enum ACCESS_LEVEL {
    EXCLUDE_AUTH = 0,
    AUTHENTICATED = 1,
    VIEW_PERMISSION = 2,
    MANAGE_PERMISSION = 3,
}
export type AccessLevel = keyof typeof ACCESS_LEVEL
