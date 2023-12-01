import { GoogleAuth } from '@/services/auth/authenticator/external/GOOGLE_OAUTH2/authenticator/google-auth';
import { KeycloakAuth } from '@/services/auth/authenticator/external/KEYCLOAK/authenticator/keycloak-auth';
import { SpaceAuth } from '@/services/auth/authenticator/local/authenticator/space-auth';

export const loadAuth = (authType?): any => {
    if (authType === 'GOOGLE_OAUTH2') return GoogleAuth;
    if (authType === 'KEYCLOAK') return KeycloakAuth;
    return SpaceAuth;
};
