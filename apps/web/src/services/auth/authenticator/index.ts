import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import type { AuthType } from '@/api-clients/identity/user/schema/type';
import { SpaceRouter } from '@/router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDisplayStore } from '@/store/display/display-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { useErrorStore } from '@/store/error/error-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';


abstract class Authenticator {
    static async signIn(credentials: Record<string, any>, authType: AuthType | 'SAML', verifyCode?: string): Promise<void> {
        const userWorkspaceStore = useUserWorkspaceStore();
        const errorStore = useErrorStore();
        const domainStore = useDomainStore();
        const userStore = useUserStore();
        const displayStore = useDisplayStore(pinia);
        await userStore.signIn({
            domainId: domainStore.state.domainId,
            credentials,
            authType,
            verify_code: verifyCode,
        });
        await userWorkspaceStore.load();
        displayStore.setIsSignInFailed(false);
        errorStore.reset();
    }

    static async signOut(): Promise<void> {
        const errorStore = useErrorStore();
        const userStore = useUserStore();
        const displayStore = useDisplayStore(pinia);
        try {
            if (SpaceRouter.router) {
                userStore.signOut();
                const userWorkspaceStore = useUserWorkspaceStore();
                userWorkspaceStore.reset();
                displayStore.setIsSignInFailed(false);
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
