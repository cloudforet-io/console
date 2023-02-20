
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { Authenticator } from '@/services/auth/authenticator';

let { gapi } = window as any;

const loadGapiInsideDOM = async () => new Promise((resolve) => {
    const element = document.getElementsByTagName('script')[0];
    const js = document.createElement('script');
    js.id = 'google-platform';
    js.src = 'https://apis.google.com/js/platform.js?onload=init';
    js.async = true;
    js.defer = true;
    element?.parentNode?.insertBefore(js, element);
    js.onload = async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolve(window?.gapi);
    };
});

class GoogleAuth extends Authenticator {
    static async signOut() {
        try {
            await GoogleAuth.loadGapi();
            const auth2 = await GoogleAuth.getAuth2(store.state.domain.authOptions.client_id);
            await GoogleAuth.disconnectGoogleSession(auth2);
            await super.signOut();
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }

    private static async onSuccess(googleUser) {
        try {
            const auth2 = await gapi.auth2.getAuthInstance();
            if (!auth2 || !auth2.isSignedIn.get()) {
                return;
            }
            // const userProfile = googleUser.getBasicProfile();
            // const userId = userProfile.getEmail();
            const credentials = {
                // eslint-disable-next-line camelcase
                access_token: googleUser.getAuthResponse().access_token,
            };
            await super.signIn(credentials);
        } catch (e: any) {
            await GoogleAuth.signOut();
            await store.dispatch('display/showSignInErrorMessage');
            throw new Error(e);
        }
    }

    static signIn = async (onSignInCallback?, onRenderFail?) => {
        await GoogleAuth.loadGapi();
        gapi.load('auth', () => {
            gapi.auth2.init({
                // eslint-disable-next-line camelcase
                client_id: store.state.domain.authOptions.client_id,
                // eslint-disable-next-line camelcase
                fetch_basic_profile: false,
                scope: 'profile',
            });
            gapi.signin2.render('g-sign-in-btn', {
                scope: 'email',
                height: 40,
                width: 'auto',
                longtitle: true,
                onsuccess: async (googleUser) => {
                    await GoogleAuth.onSuccess(googleUser);
                    if (onSignInCallback) onSignInCallback(googleUser?.wt?.cu);
                },
                onfailure: async () => {
                    await GoogleAuth.signOut();
                    if (onRenderFail) onRenderFail();
                },
            });
        });
    };

    private static loadGapi = async () => {
        try {
            if (!gapi) gapi = await loadGapiInsideDOM();
        } catch (e) {
            console.error('Failed to load gapi', e);
            throw e;
        }
    };

    private static getAuth2 = (clientId: string): Promise<any> => new Promise(((resolve, reject) => {
        if (!gapi.auth2) {
            gapi.load('auth2', () => {
                gapi.auth2.init({
                    // eslint-disable-next-line camelcase
                    client_id: clientId,
                    // eslint-disable-next-line camelcase
                    fetch_basic_profile: false,
                    scope: 'profile',
                }).then(() => {
                    resolve(gapi.auth2.getAuthInstance());
                }).catch(() => {
                    reject(new Error('Init error'));
                });
            });
        } else {
            resolve(gapi.auth2.getAuthInstance());
        }
    }));

    private static disconnectGoogleSession = (auth2): Promise<void> => new Promise(((resolve, reject) => {
        auth2.signOut().then(() => {
            auth2.disconnect();
            resolve();
        }).catch(() => {
            reject(new Error('google oauth sign out error'));
        });
    }));
}

export {
    GoogleAuth,
};
