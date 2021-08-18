import Keycloak from 'keycloak-js';
import { store } from '@/store';
import { Authenticator } from '@/views/sign-in/authenticator';

class KeycloakAuth extends Authenticator {
    private static keycloak: Keycloak.KeycloakInstance;

    private static init() {
        const authOptions = store.state.domain.authOptions;
        const issuer = authOptions.issuer;
        const parsedIssuer = issuer.split('/');

        const authIndex = parsedIssuer.indexOf('auth');
        const baseUrl = parsedIssuer[authIndex - 1];

        const realm = authOptions.realm;
        // const realmIndex = parsedIssuer.indexOf('realms');
        // const realm = parsedIssuer[realmIndex + 1];

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
        // await SpaceRouter.router.replace({ name: SIGN_IN_ROUTE._NAME });
        await KeycloakAuth.keycloak.logout();
        await super.signOut();
        await store.dispatch('display/showSignInErrorMessage');
    }

    static async signOut() {
        await super.signOut();
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
                await store.dispatch('display/showSignInErrorMessage');
                await KeycloakAuth.onSignInFail();
            });
    }
}

export {
    KeycloakAuth,
};
