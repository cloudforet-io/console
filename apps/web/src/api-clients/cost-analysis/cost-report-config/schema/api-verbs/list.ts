import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { CostReportConfigStatus } from '@/api-clients/cost-analysis/cost-report-config/schema/type';

export interface CostReportConfigListParameters {
    query?: Query;
    cost_report_config_id?: string;
    state?: CostReportConfigStatus;
    scope?: 'WORKSPACE'|'PROJECT';
}
