export const ROLE_TYPE = Object.freeze({
    SYSTEM: 'SYSTEM',
    PROJECT: 'PROJECT',
    DOMAIN: 'DOMAIN',
} as const);

export type ROLE_TYPE = typeof ROLE_TYPE[keyof typeof ROLE_TYPE];
