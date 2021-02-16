import { GoogleAuth } from '@/views/sign-in/lib/authenticator/google-auth';
import { KeycloakAuth } from '@/views/sign-in/lib/authenticator/keycloak-auth';
import { SpaceAuth } from '@/views/sign-in/lib/authenticator/space-auth';


export const loadAuth = (authType?): any => {
    if (authType === 'GOOGLE_OAUTH2') return GoogleAuth;
    if (authType === 'KEYCLOAK') return KeycloakAuth;
    return SpaceAuth;
};
