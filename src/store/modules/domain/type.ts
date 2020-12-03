export type AuthSystem = 'GOOGLE_OAUTH2' | 'ID_PW';
export type AuthType = 'INTERNAL' | 'EXTERNAL';
export type ExtendedAuthType = 'GOOGLE_OAUTH2' | 'KEYCLOCK';

export interface DomainState {
    domainId?: string;
    name?: string;
    authType?: AuthType; // deprecated
    authSystem?: AuthSystem; // deprecated
    extendedAuthType?: ExtendedAuthType;
    authOptions?: Record<string, any>;
}
