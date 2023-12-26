import type { ResourceGroup } from '@/schema/identity/role-binding/type';
import type { JobStatus } from '@/schema/inventory/job/type';

export interface JobModel {
    job_id: string;
    status: JobStatus;
    total_tasks: number;
    remained_tasks: number;
    success_tasks: number;
    failure_tasks: number;
    collector_id: string;
    secret_id?: string;
    plugin_id: string;
    resource_group: Extract<ResourceGroup, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id: string;
    domain_id: string;
    created_at?: string;
    updated_at?: string;
    finished_at: string;
}
