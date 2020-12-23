export type ExtendedAuthType = 'GOOGLE_OAUTH2' | 'KEYCLOCK';

export interface DomainState {
    domainId?: string;
    name?: string;
    extendedAuthType?: ExtendedAuthType;
    authOptions?: Record<string, any>;
}
