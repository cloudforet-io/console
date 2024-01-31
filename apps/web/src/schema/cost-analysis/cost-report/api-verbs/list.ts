import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { CostReportStatus } from '@/schema/cost-analysis/cost-report/type';


export interface CostReportListParameters {
    query?: Query;
    cost_report_id?: string;
    status?: CostReportStatus;
    issue_date?: string;
    workspace_name?: string;
}
