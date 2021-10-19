import { store } from '@/store';
import { Authenticator } from '@/services/auth/authenticator';
import { AUTH_ROUTE } from '@/services/auth/routes';
import { SpaceRouter } from '@/router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

class KbAuth extends Authenticator {
    // TODO: KB SSO 로직 (ex. init sso client, sign in 로직 등)

    /*
	  Sign-in 로직 작성
	 KB SSO sign-in 후, 상속받은 spaceONE 자체 authenticator의 sign in 로직 수행
	 */
    static async signIn(onSignInCallback, query) {
        try {
            const clientIP = await SpaceConnector.client.identity.user.getIp();
            console.log('clientIP : ', clientIP);
            const credentials = {
                secureToken: query.secureToken,
                secureSessionId: query.secureSessionId,
                requestData: 'id,name',
                agentId: 'test',
                clientIP,
            };

            await super.signIn(credentials);

            if (onSignInCallback) onSignInCallback();
        } catch (e) {
            await KbAuth.onSignInFail();
        }
    }

    /*
	  Sign out 로직 작성
	  KB SSO sign-out 후, super.signOut() 메소드 호출 (내부적으로 loader를 통해 어떤 SSO를 불러야 하는 지 선택하여 sign out함)
	 */
    static async signOut() {
        try {
            await super.signOut();
        } catch (e) {
            console.error(e);
        }
    }

    /*
	   Sign-in 실패 로직 작성 시,
	   만약 브릿지 페이지가 필요한 경우(구글이 아닌 키클락의 예처럼, SSO를 위해 새 창이 열리는 경우)
	    await SpaceRouter.router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME, query: { error: 'error' } });를 통해
	    sign in page에 에러 표시를 할 수 있도록 추가하기
	 */
    private static async onSignInFail() {
        await SpaceRouter.router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME, query: { error: 'error' } });
    }
}

export {
    KbAuth,
};
