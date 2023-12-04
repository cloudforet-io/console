export interface ServiceAccountModel {
    service_account_id: string;
    name: string;
    data: {
        [key: string]: string;
    },
    provider: string;
    tags: { [key: string]: unknown; };
    trusted_account_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}

