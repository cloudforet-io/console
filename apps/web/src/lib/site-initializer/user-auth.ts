import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

export const initUserAndAuth = async (store, config) => {
    let userId = store.state.user.userId;
    const isTokenAlive = SpaceConnector.isTokenAlive;
    const devMode = config.get('DEV.ENABLED');
    const authEnabled = config.get('DEV.AUTH.ENABLED');
    if (devMode && authEnabled) userId = config.get('DEV.AUTH.USER_ID');

    if (userId && isTokenAlive) {
        const response = await SpaceConnector.clientV2.identity.userProfile.get();
        store.dispatch('user/setUser', {
            userId: response.user_id,
            roleType: response.role_type,
            authType: response.auth_type,
            name: response.name,
            email: response.email,
            language: response.language,
            timezone: response.timezone,
            requiredActions: response.required_actions,
            emailVerified: !!response.email_verified,
            mfa: response.mfa,
        });

        return userId;
    }

    SpaceConnector.flushToken();
    store.dispatch('user/setIsSessionExpired', true);
    throw new Error('Site initialization failed: Invalid user');
};
