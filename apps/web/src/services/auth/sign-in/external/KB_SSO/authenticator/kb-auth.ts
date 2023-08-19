import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { Authenticator } from '@/services/auth/authenticator';
import { AUTH_ROUTE } from '@/services/auth/route-config';

class KbAuth extends Authenticator {
    static async signIn(onSignInCallback, query) {
        try {
            store.dispatch('user/startSignIn');
            const clientIP = await SpaceConnector.client.identity.user.getIp();
            const credentials = {
                secureToken: query.secureToken,
                secureSessionId: query.secureSessionId,
                requestData: 'id,name',
                agentId: store.state['domain/authOptions'].agent_id,
                clientIP,
            };

            await super.signIn(credentials);

            if (onSignInCallback) onSignInCallback();
        } catch (e) {
            await KbAuth.onSignInFail();
        } finally {
            store.dispatch('user/finishSignIn');
        }
    }

    static async signOut() {
        try {
            await super.signOut();
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }

    private static async onSignInFail() {
        await SpaceRouter.router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME, query: { error: 'error' } });
    }
}

export {
    KbAuth,
};
