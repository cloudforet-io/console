import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { JobStatus } from '@/schema/inventory/job/type';

export interface JobListParameters {
    query?: Query;
    job_id?: string;
    status?: JobStatus;
    collector_id?: string;
    secret_id?: string;
    plugin_id?: string;
    workspace_id?: string;
}
