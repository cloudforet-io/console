import type { ReportAdjustmentMethod } from '@/api-clients/cost-analysis/report-adjustment/schema/type';

export interface ReportAdjustmentModel {
    report_adjustment_id: string;
    name: string;
    method: ReportAdjustmentMethod;
    value: number;
    description: string;
    provider: string;
    currency: string;
    order: number;
    adjustment_filter: Record<string, string>;
    cost_report_config_id: string;
    report_adjustment_policy_id: string;
    domain_id: string;
    workspace_id: string;
    project_id: string;
    created_at: string;
    updated_at: string;
}
