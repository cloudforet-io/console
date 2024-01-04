import Keycloak from 'keycloak-js';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { Authenticator } from '@/services/auth/authenticator';

const BASE_URL = window.location.origin;

class KeycloakAuth extends Authenticator {
    private static keycloak: Keycloak.KeycloakInstance;

    private static init() {
        /* keycloak init options */
        const authOptions = store.state.domain.authOptions;
        const authorizationEndpoint = authOptions.authorization_endpoint;
        if (!KeycloakAuth.isValidAuthorizationEndpoint(authorizationEndpoint)) {
            throw new Error('authorizationEndpoint is not valid: please check your keycloak configuration.'
                + ' It should be like "https://{keycloak-server}/realms/{your-realm}/protocol/openid-connect/auth"');
        }
        const parsedIssuer = authorizationEndpoint.split('/realms');
        const baseUrl = parsedIssuer[0];
        const realm = authOptions.realm;
        const clientId = authOptions.client_id;

        const initOptions = {
            url: baseUrl,
            realm,
            clientId,
            'enable-cors': true,
        };
        KeycloakAuth.keycloak = Keycloak(initOptions);
    }

    private static isValidAuthorizationEndpoint(url:string) {
        const keycloakAuthUrlPattern = /^https:\/\/[^/]+(\/auth)?\/realms\/[^/]+\/protocol\/openid-connect\/auth$/;
        return keycloakAuthUrlPattern.test(url);
    }

    private static async onSignInFail() {
        if (KeycloakAuth.keycloak) await KeycloakAuth.keycloak.logout({ redirectUri: `${BASE_URL}/sign-in/?error=error` });
    }

    static async signOut() {
        await super.signOut();
        if (KeycloakAuth.keycloak) await KeycloakAuth.keycloak.logout({ redirectUri: `${BASE_URL}/sign-in` });
    }

    private static async keycloakSignIn(auth) {
        try {
            store.dispatch('user/startSignIn');
            if (!auth) {
                await KeycloakAuth.onSignInFail();
                return;
            }
            if (KeycloakAuth.keycloak.token && KeycloakAuth.keycloak.idToken) {
                // eslint-disable-next-line camelcase
                await super.signIn(
                    { access_token: KeycloakAuth.keycloak.token },
                    'EXTERNAL',
                );
            }
        } catch (e) {
            store.dispatch('user/finishSignIn');
            throw e;
        }
    }

    static async signIn(onSignInCallback) {
        KeycloakAuth.init();
        KeycloakAuth.keycloak.init({ onLoad: 'login-required', checkLoginIframe: false })
            .then(async (auth) => {
                await KeycloakAuth.keycloakSignIn(auth);
                await onSignInCallback();
            })
            .catch(async (e) => {
                ErrorHandler.handleError(e);
                await KeycloakAuth.onSignInFail();
            });
    }
}

export {
    KeycloakAuth,
};
