import type { IdentityJobStatus } from '@/api-clients/identity/job/schema/type';

export interface IdentityJobModel {
    job_id: string;
    status: IdentityJobStatus;
    options: Record<string, any>;
    error_message: string;
    resource_group: 'DOMAIN' | 'WORKSPACE';
    trusted_account_id: string;
    plugin_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
    finished_at: string;
}
