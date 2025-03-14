import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { IdentityJobStatus } from '@/api-clients/identity/job/schema/type';

export interface IdentityJobListParameters {
    query?: Query;
    job_id?: string;
    status?: IdentityJobStatus;
    trusted_account_id?: string;
    plugin_id?: string;
    workspace_id?: string;
}
