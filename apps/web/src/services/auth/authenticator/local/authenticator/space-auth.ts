import { store } from '@/store';

import { Authenticator } from '@/services/auth/authenticator';

class SpaceAuth extends Authenticator {
    // eslint-disable-next-line class-methods-use-this
    static async signIn(userId, credentials, userType?): Promise<void> {
        try {
            store.dispatch('user/startSignIn');
            await super.signIn(userId, credentials, userType);
        } finally {
            store.dispatch('user/finishSignIn');
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
