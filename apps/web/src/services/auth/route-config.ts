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
    RESET_PASSWORD: { _NAME: 'resetPassword' },
});
