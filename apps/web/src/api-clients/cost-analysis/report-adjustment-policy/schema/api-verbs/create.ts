import type { Tags } from '@/api-clients/_common/schema/model';
import type { ReportAdjustmentPolicyFilter, ReportAdjustmentPolicyScope } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/type';


export interface ReportAdjustmentPolicyCreateParameters {
    scope: ReportAdjustmentPolicyScope;
    cost_report_config_id: string;
    order?: number;
    description?: string;
    tags?: Tags;
    policy_filter: ReportAdjustmentPolicyFilter;
}
