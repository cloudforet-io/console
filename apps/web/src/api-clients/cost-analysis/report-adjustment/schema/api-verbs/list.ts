import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface ReportAdjustmentListParameters {
    query?: Query;
    provider?: string;
    report_adjustment_id?: string;
    report_adjustment_policy_id?: string;
    cost_report_config_id?: string;
}
