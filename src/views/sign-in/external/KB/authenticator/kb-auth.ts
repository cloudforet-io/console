import { store } from '@/store';
import { Authenticator } from '@/views/sign-in/authenticator';
import { SIGN_IN_ROUTE } from '@/routes/sign-in/sign-in-route';
import { SpaceRouter } from '@/routes';

class KbAuth extends Authenticator {
    // TODO: KB SSO 로직 (ex. init sso client, sign in 로직 등)

    /*
	  Sign-in 로직 작성
	 KB SSO sign-in 후, 상속받은 spaceONE 자체 authenticator의 sign in 로직 수행

      const clientIP = await SpaceConnector.client.identity.user.getIp();
      const credentials = {
          secureToken: zzzzz,
          secureSessionId: xxx,
          requestData: ?,
          agentId: xxx,
          clientIP: ?
      };
	 super.signIn(credentials);

	 */

    /*
	  Sign out 로직 작성
	  KB SSO sign-out 후, super.signOut() 메소드 호출 (내부적으로 loader를 통해 어떤 SSO를 불러야 하는 지 선택하여 sign out함)
	 */

    /*
	   Sign-in 실패 로직 작성 시,
	   만약 브릿지 페이지가 필요한 경우(구글이 아닌 키클락의 예처럼, SSO를 위해 새 창이 열리는 경우)
	    await SpaceRouter.router.replace({ name: SIGN_IN_ROUTE._NAME, query: { error: 'error' } });를 통해
	    sign in page에 에러 표시를 할 수 있도록 추가하기
	 */

}

export {
    KbAuth,
};
