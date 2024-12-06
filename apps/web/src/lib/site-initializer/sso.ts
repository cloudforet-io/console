import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useDisplayStore } from '@/store/display/display-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import { isMobile } from '@/lib/helper/cross-browsing-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';



export const checkSsoAccessToken = async () => {
    const currentPath = window.location.pathname;
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const ssoAccessToken = params.get('sso_access_token');
    const domainStore = useDomainStore(pinia);
    const userStore = useUserStore(pinia);
    const displayStore = useDisplayStore(pinia);

    // only for reset-password page
    if (ssoAccessToken && currentPath === '/') {
        if (SpaceConnector.isTokenAlive) {
            try {
                const authType = domainStore.state.extendedAuthType;
                await loadAuth(authType).signOut();
                userStore.setIsSessionExpired(true);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }
        if (isMobile()) {
            displayStore.setVisibleMobileGuideModal(true);
        } else {
            window.location.pathname = '/reset-password';
        }
    }
};
