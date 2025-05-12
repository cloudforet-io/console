import type { ReportAdjustmentMethod } from '@/api-clients/cost-analysis/report-adjustment/schema/type';


export interface ReportAdjustmentCreateParameters {
    name: string;
    method: ReportAdjustmentMethod;
    value: number;
    report_adjustment_policy_id: string;
    provider: string;
    description?: string;
    currency?: string;
    order?: number;
    filters?: Record<string, string>;
}
