export interface TrustedAccountModel {
    trusted_account_id: string;
    name: string;
    data: {
        [key: string]: string;
    },
    provider: string;
    tags: { [key: string]: unknown; };
    permission_group: 'DOMAIN' | 'WORKSPACE';
    workspace_id?: string;
    domain_id?: string;
    created_at?: string;
}


