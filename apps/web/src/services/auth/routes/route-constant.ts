export const AUTH_ROUTE = Object.freeze({
    _NAME: 'auth',
    SIGN_IN: {
        _NAME: 'signIn',
        KEYCLOAK: { _NAME: 'keycloak' },
        MULTI_FACTOR_AUTH: { _NAME: 'multiFactorAuth' },
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
    SAML: {
        _NAME: 'saml',
    },
});
