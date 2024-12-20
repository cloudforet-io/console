import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { SpaceRouter } from '@/router';
import type { AuthType } from '@/schema/identity/user/type';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDisplayStore } from '@/store/display/display-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { useErrorStore } from '@/store/error/error-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import { initTaskManagementTemplate } from '@/lib/site-initializer/initTaskManagementTemplate';


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
        await initTaskManagementTemplate();
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
