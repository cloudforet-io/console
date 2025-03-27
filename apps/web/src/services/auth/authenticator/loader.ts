import type { ExtendedAuthType } from '@/api-clients/config/domain-config/schema/type';

import { GoogleAuth } from '@/services/auth/authenticator/external/GOOGLE_OAUTH2/authenticator/google-auth';
import { KeycloakAuth } from '@/services/auth/authenticator/external/KEYCLOAK_OIDC/authenticator/keycloak-auth';
import { SamlAuth } from '@/services/auth/authenticator/external/SAML/authenticator/saml-auth';
import { SpaceAuth } from '@/services/auth/authenticator/local/authenticator/space-auth';

export const loadAuth = (authType?:ExtendedAuthType): any => {
    if (authType === 'GOOGLE_OAUTH2') return GoogleAuth;
    if (authType === 'KEYCLOAK_OIDC') return KeycloakAuth;
    if (authType === 'SAML') return SamlAuth;
    return SpaceAuth;
};
