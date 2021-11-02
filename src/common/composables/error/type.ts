export const CONSOLE_ERROR_CODE = {
    DEFAULT_ERROR: 'DefaultError',
    NO_RESOURCE_ERROR: 'NoResourceError',
    NO_SEARCH_RESOURCE_ERROR: 'NoSearchResourceError',
    AUTHENTICATION_ERROR: 'AuthenticationError',
    AUTHORIZATION_ERROR: 'AuthorizationError',
} as const;

export type CONSOLE_ERROR_CODE = typeof CONSOLE_ERROR_CODE[keyof typeof CONSOLE_ERROR_CODE];
