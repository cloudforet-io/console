import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { SpaceRouter } from '@/router';
import type { AuthType } from '@/schema/identity/user/type';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { useErrorStore } from '@/store/error/error-store';


abstract class Authenticator {
    static async signIn(credentials: Record<string, any>, authType: AuthType | 'SAML', verifyCode?: string): Promise<void> {
        const userWorkspaceStore = useUserWorkspaceStore();
        const errorStore = useErrorStore();
        const domainStore = useDomainStore();
        await store.dispatch('user/signIn', {
            domainId: domainStore.state.domainId,
            credentials,
            authType,
            verify_code: verifyCode,
        });
        await userWorkspaceStore.load();
        await store.dispatch('display/hideSignInErrorMessage');
        errorStore.reset();
    }

    static async signOut(): Promise<void> {
        const errorStore = useErrorStore();
        try {
            if (SpaceRouter.router) {
                await store.dispatch('user/signOut');
                const userWorkspaceStore = useUserWorkspaceStore();
                userWorkspaceStore.reset();
                await store.dispatch('display/hideSignInErrorMessage');
                LocalStorageAccessor.removeItem('hideNotificationEmailModal');
                errorStore.reset();
            }
        } catch (e: unknown) {
            console.error('user sign out failed', e);
        }
    }
}

export {
    Authenticator,
};
