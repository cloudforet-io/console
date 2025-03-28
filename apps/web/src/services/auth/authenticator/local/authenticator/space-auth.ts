import type { AuthType } from '@/api-clients/identity/user/schema/type';

import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import { Authenticator } from '@/services/auth/authenticator';

class SpaceAuth extends Authenticator {
    // eslint-disable-next-line class-methods-use-this
    static async signIn(credentials, authType: AuthType, verifyCode?: string): Promise<void> {
        const userStore = useUserStore(pinia);
        try {
            userStore.setIsSignInLoading(true);
            await super.signIn(credentials, authType, verifyCode);
        } finally {
            userStore.setIsSignInLoading(false);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    static async signOut(): Promise<void> {
        await super.signOut();
    }
}

export {
    SpaceAuth,
};
