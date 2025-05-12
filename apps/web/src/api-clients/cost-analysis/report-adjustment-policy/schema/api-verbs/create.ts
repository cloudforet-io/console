import type { Tags } from '@/api-clients/_common/schema/model';
import type { ReportAdjustmentPolicyScope } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/type';


export interface ReportAdjustmentPolicyCreateParameters {
    name: string;
    scope: ReportAdjustmentPolicyScope;
    cost_report_config_id: string;
    order?: number;
    tags: Tags;
    project_id: string;
    workspace_id: string;
}
