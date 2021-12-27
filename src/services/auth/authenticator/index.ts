import { store } from '@/store';
import { SpaceRouter } from '@/router';

type UserType = 'USER' | 'DOMAIN_OWNER' | 'API_USER';


abstract class Authenticator {
    static async signIn(credentials: Record<string, any>, userId?: string, userType?: UserType): Promise<void> {
        try {
            await store.dispatch('user/signIn', {
                domainId: store.state.domain.domainId,
                credentials,
                userType: userType || 'USER',
                userId,
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    static async signOut(): Promise<void> {
        try {
            if (SpaceRouter.router) {
                await SpaceRouter.router.app.$store.dispatch('user/signOut');
                await SpaceRouter.router.app.$store.dispatch('error/resetErrorState');
            }
        } catch (e) {
            console.error('user sign out failed', e);
        }
    }
}


export {
    Authenticator,
};
