import { Authenticator } from '@/services/auth/authenticator';

class SpaceAuth extends Authenticator {
    // eslint-disable-next-line class-methods-use-this
    static async signIn(userId, credentials, userType?): Promise<void> {
        await super.signIn(userId, credentials, userType);
    }

    // eslint-disable-next-line class-methods-use-this
    static async signOut(): Promise<void> {
        await super.signOut();
    }
}

export {
    SpaceAuth,
};
