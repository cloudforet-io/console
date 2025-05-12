import type { Tags } from '@/api-clients/_common/schema/model';
import type { ReportAdjustmentPolicyScope, ReportAdjustmentPolicyState } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/type';

export interface ReportAdjustmentPolicyModel {
    report_adjustment_policy_id: string;
    name: string;
    scope: ReportAdjustmentPolicyScope;
    order: number;
    state: ReportAdjustmentPolicyState;
    adjustments: string[];
    tags: Tags;
    cost_report_config_id: string;
    domain_id: string;
    workspace_id: string;
    project_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}
