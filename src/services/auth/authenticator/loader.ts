import { GoogleAuth } from '@/services/auth/sign-in/external/GOOGLE_OAUTH2/authenticator/google-auth';
import { KeycloakAuth } from '@/services/auth/sign-in/external/KEYCLOAK/authenticator/keycloak-auth';
import { SpaceAuth } from '@/services/auth/sign-in/local/authenticator/space-auth';
import { KbAuth } from '@/services/auth/sign-in/external/KB_SSO/authenticator/kb-auth';


export const loadAuth = (authType?): any => {
    if (authType === 'GOOGLE_OAUTH2') return GoogleAuth;
    if (authType === 'KEYCLOAK') return KeycloakAuth;
    if (authType === 'KB_SSO') return KbAuth;
    return SpaceAuth;
};
