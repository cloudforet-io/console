import Keycloak from 'keycloak-js';
import { store } from '@/store';
import { Authenticator } from '@/services/auth/authenticator';
import { SpaceRouter } from '@/router';
import { AUTH_ROUTE } from '@/services/auth/routes';

const BASE_URL = window.location.origin;

class KeycloakAuth extends Authenticator {
    private static keycloak: Keycloak.KeycloakInstance;

    private static init() {
        /* keycloak init options */
        const authOptions = store.state.domain.authOptions;
        const issuer = authOptions.issuer;
        const parsedIssuer = issuer.split('/');
        const authIndex = parsedIssuer.indexOf('auth');
        const baseUrl = parsedIssuer[authIndex - 1];
        const realm = authOptions.realm;
        const clientId = authOptions.client_id;

        const initOptions = {
            url: `https://${baseUrl}/auth`,
            realm,
            clientId,
            'enable-cors': true,
        };
        KeycloakAuth.keycloak = Keycloak(initOptions);
    }

    private static async onSignInFail() {
        if (KeycloakAuth.keycloak) await KeycloakAuth.keycloak.logout({ redirectUri: `${BASE_URL}/sign-in/?error=error` });
    }

    static async signOut() {
        await super.signOut();
        if (KeycloakAuth.keycloak) await KeycloakAuth.keycloak.logout({ redirectUri: `${BASE_URL}/sign-in` });
    }

    private static async keycloakSignIn(auth) {
        if (!auth) {
            await KeycloakAuth.onSignInFail();
            return;
        }
        if (KeycloakAuth.keycloak.token && KeycloakAuth.keycloak.idToken && KeycloakAuth.keycloak.token !== '' && KeycloakAuth.keycloak.idToken !== '') {
            // eslint-disable-next-line camelcase
            await super.signIn(
                { access_token: KeycloakAuth.keycloak.token },
            );
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
                console.error(e);
                await KeycloakAuth.onSignInFail();
            });
    }
}

export {
    KeycloakAuth,
};
