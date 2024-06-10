import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { Authenticator } from '@/services/auth/authenticator';

class SamlAuth extends Authenticator {
    static async signOut() {
        try {
            await super.signOut();
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }

    static async onSuccess(refreshToken:string) {
        try {
            store.dispatch('user/startSignIn');
            const credentials = {
                refreshToken,
            };
            await super.signIn(credentials, 'SAML');
        } catch (e: any) {
            await SamlAuth.signOut();
            await store.dispatch('display/showSignInErrorMessage');
            throw e;
        } finally {
            store.dispatch('user/finishSignIn');
        }
    }
}

export {
    SamlAuth,
};
