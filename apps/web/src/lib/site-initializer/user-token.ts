import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserModel } from '@/api-clients/identity/user/schema/model';

import { useDomainStore } from '@/store/domain/domain-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';


export const initUserAndToken = async (config): Promise<string | undefined> => {
    const domainStore = useDomainStore(pinia);
    const userStore = useUserStore(pinia);
    let userId = userStore.state.userId;

    const domainSettings = domainStore.state.config?.settings;
    const isTokenAlive = SpaceConnector.isTokenAlive;
    const devMode = config.get('DEV.ENABLED');
    const authEnabled = config.get('DEV.AUTH.ENABLED');
    if (devMode && authEnabled) userId = config.get('DEV.AUTH.USER_ID');

    if (userId && isTokenAlive) {
        try {
            const response = await SpaceConnector.clientV2.identity.userProfile.get<undefined, UserModel>();
            await userStore.setUserInfo({
                userId: response.user_id,
                roleType: response.role_type,
                authType: response.auth_type,
                name: response.name,
                email: response.email,
                language: response.language || domainSettings?.language,
                timezone: response.timezone || domainSettings?.timezone,
                requiredActions: response.required_actions,
                emailVerified: !!response.email_verified,
                mfa: response.mfa,
            });

            return userId;
        } catch (e) {
            console.error(e);
        }
    } else {
        await userStore.setUserInfo({
            language: domainSettings?.language,
        });
    }

    SpaceConnector.flushToken();
    userStore.setIsSessionExpired(true);
    return undefined;
};
