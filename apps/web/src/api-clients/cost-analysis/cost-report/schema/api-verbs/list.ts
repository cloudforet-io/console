import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { CostReportStatus } from '@/api-clients/cost-analysis/cost-report/schema/type';


export interface CostReportListParameters {
    query?: Query;
    cost_report_config_id?: string;
    cost_report_id?: string;
    status?: CostReportStatus;
    issue_date?: string;
    name?: string;
}
