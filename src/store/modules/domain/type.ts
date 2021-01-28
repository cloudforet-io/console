export type ExtendedAuthType = 'GOOGLE_OAUTH2' | 'KEYCLOAK';

export interface DomainState {
    domainId?: string;
    name?: string;
    extendedAuthType?: ExtendedAuthType;
    authOptions?: Record<string, any>;
}
