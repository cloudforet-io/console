import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

export const initUserAndAuth = async (store, config) => {
    let userId = store.state.user.userId;
    const isTokenAlive = SpaceConnector.isTokenAlive;
    const devMode = config.get('DEV.ENABLED');
    const authEnabled = config.get('DEV.AUTH.ENABLED');
    if (devMode && authEnabled) userId = config.get('DEV.AUTH.USER_ID');

    if (userId && isTokenAlive) {
        const reponse = await SpaceConnector.clientV2.identity.user.get({
            user_id: userId,
            domain_id: store.state.domain.domainId,
        });
        store.dispatch('user/setUser', {
            userId: reponse.user_id,
            roleType: reponse.role_type,
            authType: reponse.auth_type,
            name: reponse.name,
            email: reponse.email,
            language: reponse.language,
            timezone: reponse.timezone,
            requiredActions: reponse.required_actions,
            emailVerified: !!reponse.email_verified,
            mfa: reponse.mfa,
        });

        return userId;
    }

    SpaceConnector.flushToken();
    store.dispatch('user/setIsSessionExpired', true);
    return undefined;
};
