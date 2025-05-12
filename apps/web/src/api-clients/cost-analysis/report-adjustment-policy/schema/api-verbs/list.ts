import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ReportAdjustmentPolicyState } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/type';

export interface ReportAdjustmentPolicyListParameters {
    query?: Query;
    name?: string;
    state?: ReportAdjustmentPolicyState;
    workspace_id?: string;
    user_projects?: string[];
}
