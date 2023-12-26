export interface ServiceAccountModel {
    service_account_id: string;
    name: string;
    data: {
        [key: string]: string;
    },
    provider: string;
    tags: { [key: string]: unknown; };
    secret_schema_id: string;
    secret_id: string;
    trusted_account_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}

