import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { Authenticator } from '@/services/auth/authenticator';

let { google } = window as any;

const loadGapiInsideDOM = async () => new Promise((resolve) => {
    const element = document.getElementsByTagName('script')[0];
    const js = document.createElement('script');
    js.id = 'google-platform';
    js.src = 'https://accounts.google.com/gsi/client';
    js.async = true;
    js.defer = true;
    element?.parentNode?.insertBefore(js, element);
    js.onload = async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolve(window?.google);
    };
});

class GoogleAuth extends Authenticator {
    private static accessToken: string|null = null;

    static async signOut() {
        try {
            await GoogleAuth.loadGapi();
            GoogleAuth.disconnectGoogleSession(GoogleAuth.accessToken);
            await super.signOut();
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }

    static async onSuccess(accessToken) {
        try {
            GoogleAuth.accessToken = accessToken;
            const credentials = {
                access_token: accessToken,
            };
            await super.signIn(credentials);
        } catch (e: any) {
            await GoogleAuth.signOut();
            await store.dispatch('display/showSignInErrorMessage');
            throw new Error(e);
        }
    }

    static signIn = async (onSignInCallback?) => {
        await GoogleAuth.loadGapi();
        const tokenClient = await google.accounts.oauth2.initTokenClient({
            client_id: store.state.domain.authOptions.client_id,
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
            include_granted_scopes: false,
            callback: async (res) => {
                if (google.accounts.oauth2.hasGrantedAllScopes(res, 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email')) {
                    await GoogleAuth.onSuccess(res.access_token);
                    if (onSignInCallback) onSignInCallback();
                } else {
                    ErrorHandler.handleError(new Error('GoogleAuth.signIn: has not granted all scopes'), {
                        title: 'Google SSO Error',
                        description: "Sorry, but we're having trouble with signing you in. Please contact system administrator.",
                    });
                }
            },
        });
        tokenClient.requestAccessToken();
    };

    private static loadGapi = async () => {
        try {
            if (!google) google = await loadGapiInsideDOM();
        } catch (e) {
            console.error('Failed to load google', e);
            throw e;
        }
    };

    private static disconnectGoogleSession = (accessToken:string|null) => {
        try {
            if (accessToken) google.accounts.oauth2.revoke(accessToken);
            GoogleAuth.accessToken = null;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };
}

export {
    GoogleAuth,
};
