export interface TrustedAccountListParameters {
    query?: any;
    trusted_account_id?: string;
    name?: string;
    provider?: string;
    permission_group?: 'DOMAIN' | 'WORKSPACE';
    workspace_id?: string;
    domain_id?: string;
}
