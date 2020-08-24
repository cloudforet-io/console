export type AuthType = 'GOOGLE_OAUTH2' | 'ID_PW';

export interface DomainState {
    domainId?: string;
    name?: string;
    authType?: AuthType;
}
