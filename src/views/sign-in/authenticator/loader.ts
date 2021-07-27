import { GoogleAuth } from '@/views/sign-in/external/GOOGLE_OAUTH2/authenticator/google-auth';
import { KeycloakAuth } from '@/views/sign-in/external/KEYCLOAK/authenticator/keycloak-auth';
import { SpaceAuth } from '@/views/sign-in/local/authenticator/space-auth';


export const loadAuth = (authType?): any => {
    if (authType === 'GOOGLE_OAUTH2') return GoogleAuth;
    if (authType === 'KEYCLOAK') return KeycloakAuth;
    return SpaceAuth;
};
