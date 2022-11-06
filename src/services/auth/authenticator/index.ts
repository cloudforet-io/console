import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { setI18nLocale } from '@/translations';

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
            await Promise.allSettled([
                store.dispatch('domain/setBillingEnabled'),
                // INIT REFERENCE STORE
                store.dispatch('reference/loadAll', { force: true }),
                setI18nLocale(store.state.user.language),
            ]);
        } catch (e: unknown) {
            throw e;
        }
    }

    static async signOut(): Promise<void> {
        try {
            if (SpaceRouter.router) {
                await store.dispatch('user/signOut');
                await store.dispatch('error/resetErrorState');
                await store.dispatch('domain/resetBillingEnabled');
            }
        } catch (e: unknown) {
            console.error('user sign out failed', e);
        }
    }
}

export {
    Authenticator,
};
