import type { Tags } from '@/api-clients/_common/schema/model';
import type { ReportAdjustmentPolicyFilter, ReportAdjustmentPolicyScope } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/type';

export interface ReportAdjustmentPolicyModel {
    report_adjustment_policy_id: string;
    description: string;
    scope: ReportAdjustmentPolicyScope;
    order: number;
    adjustments: string[];
    tags: Tags;
    policy_filter: ReportAdjustmentPolicyFilter;
    cost_report_config_id: string;
    domain_id: string;
    workspace_id: string;
    project_id: string;
    created_at: string;
    updated_at: string;
}
