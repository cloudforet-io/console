import { useDisplayStore } from '@/store/display/display-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

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
        const userStore = useUserStore(pinia);
        const displayStore = useDisplayStore(pinia);
        try {
            userStore.setIsSignInLoading(true);
            const credentials = {
                refreshToken,
            };
            await super.signIn(credentials, 'SAML');
        } catch (e: any) {
            await SamlAuth.signOut();
            displayStore.setIsSignInFailed(true);
            throw e;
        } finally {
            userStore.setIsSignInLoading(false);
        }
    }
}

export {
    SamlAuth,
};
