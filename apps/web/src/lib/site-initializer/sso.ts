import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { isMobile } from '@/lib/helper/cross-browsing-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';

export const checkSsoAccessToken = async (store) => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const ssoAccessToken = params.get('sso_access_token');

    if (window.location.pathname === '/reset-password') {
        if (isMobile()) store.dispatch('display/showMobileGuideModal');
        return;
    }
    // signOut
    if (ssoAccessToken) {
        if (SpaceConnector.isTokenAlive) {
            try {
                const authType = store.state.domain.extendedAuthType;
                await loadAuth(authType).signOut();
                await store.dispatch('user/setIsSessionExpired', true);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }
        if (isMobile()) store.dispatch('display/showMobileGuideModal');
        else window.location.pathname = '/reset-password';
    }
};
