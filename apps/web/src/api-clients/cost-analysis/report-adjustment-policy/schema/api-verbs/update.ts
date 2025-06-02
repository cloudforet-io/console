import type { Tags } from '@/api-clients/_common/schema/model';
import type { ReportAdjustmentPolicyFilter } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/type';

export interface ReportAdjustmentPolicyUpdateParameters {
    report_adjustment_policy_id: string;
    description?: string;
    policy_filter?: ReportAdjustmentPolicyFilter;
    tags?: Tags;
}
