import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { JobStatus } from '@/schema/inventory/job/type';

export interface CostJobListParameters {
    query?: Query;
    job_id?: string;
    status?: JobStatus;
    data_source_id?: string;
    workspace_id?: string;
}
