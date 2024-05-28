

export interface DomainGetAuthInfoParams {
    name: string;
}

export interface DomainGetAuthInfoResponse {
    domain_id: string;
    name: string;
    external_auth_state: 'ENABLED' | 'DISABLED';
    metadata: Metadata;
    config: Record<string, any>;
}

export interface Metadata {
    token_endpoint?: string;
    authorization_endpoint?: string;
    auth_type: string;
    protocol: 'oidc' | 'saml' | 'oauth2';
    identity_provider?: string;
    end_session_endpoint?: string;
    userinfo_endpoint?: string;
    realm?: string; // only keycloack
    // for saml
    icon?: string;
    label?: string;
    sso_url?: string;
    [key: string]: any;
}
