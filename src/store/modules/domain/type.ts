export type AuthSystem = 'GOOGLE_OAUTH2' | 'ID_PW';
export type AuthType = 'INTERNAL' | 'EXTERNAL';

export interface DomainState {
    domainId?: string;
    name?: string;
    authType?: AuthType;
    authSystem?: AuthSystem;
    authOptions?: Record<string, any>;
}
