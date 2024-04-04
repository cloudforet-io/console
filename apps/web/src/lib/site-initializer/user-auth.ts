import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserModel } from '@/schema/identity/user/model';

export const initUserAndAuth = async (store, config): Promise<string | undefined> => {
    let userId = store.state.user.userId;
    const domainSettings = store.state.domain.config?.settings;
    const isTokenAlive = SpaceConnector.isTokenAlive;
    const devMode = config.get('DEV.ENABLED');
    const authEnabled = config.get('DEV.AUTH.ENABLED');
    if (devMode && authEnabled) userId = config.get('DEV.AUTH.USER_ID');

    if (userId && isTokenAlive) {
        try {
            const response = await SpaceConnector.clientV2.identity.userProfile.get<undefined, UserModel>();
            store.commit('user/setUser', {
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
        store.commit('user/setUser', {
            language: domainSettings?.language,
        });
    }

    SpaceConnector.flushToken();
    store.dispatch('user/setIsSessionExpired', true);
    return undefined;
};
