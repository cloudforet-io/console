import type { JobStatus } from '@/schema/inventory/job/type';

import type { JobTaskError } from '@/services/asset-inventory/types/collector-history-job-type';


export interface JobTaskModel {
    job_task_id: string;
    status: JobStatus;
    provider: string;
    create_count: number;
    updated_count: number;
    failure_count: number;
    deleted_count: number;
    disconnected_count: number;
    errors: JobTaskError[];
    job_id: string;
    secret_id: string;
    service_account_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    started_at: string;
    finished_at: string;
}
