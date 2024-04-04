import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { JobStatus } from '@/schema/inventory/job/type';

export interface JobTaskListParameters {
    query?: Query;
    job_task_id?: string;
    status?: JobStatus;
    provider?: string;
    job_id?: string;
    secret_id?: string;
    service_account_id?: string;
    project_id?: string;
    workspace_id?: string;
}
