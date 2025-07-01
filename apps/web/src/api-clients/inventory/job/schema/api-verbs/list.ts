import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { JobStatus } from '@/api-clients/inventory/job/schema/type';

export interface JobListParameters {
    query?: Query;
    job_id?: string;
    status?: JobStatus;
    collector_id?: string;
    secret_id?: string;
    plugin_id?: string;
    workspace_id?: string;
    data_source_id?: string;
}
