export const AUTH_ROUTE = Object.freeze({
    _NAME: 'auth',
    ADMIN_SIGN_IN: { _NAME: 'domainAdminSignIn' },
    SIGN_IN: {
        _NAME: 'signIn',
        KEYCLOAK: { _NAME: 'keycloak' },
        KB: { _NAME: 'KB_SSO', _PATH: 'kbfg-sso' },
    },
    SIGN_OUT: {
        _NAME: 'signOut',
    },
    PASSWORD: {
        _NAME: 'password',
        STATUS: {
            FIND: { _NAME: 'find' },
            RESET: { _NAME: 'reset' },
        },
    },
    EMAIL: {
        _NAME: 'email',
        INVALID: { _NAME: 'invalid' },
    },
});
