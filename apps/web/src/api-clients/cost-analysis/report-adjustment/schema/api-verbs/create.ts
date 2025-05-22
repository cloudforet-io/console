import type { ReportAdjustmentUnit } from '@/api-clients/cost-analysis/report-adjustment/schema/type';


export interface ReportAdjustmentCreateParameters {
    name: string;
    unit: ReportAdjustmentUnit;
    value: number;
    report_adjustment_policy_id: string;
    provider: string;
    description?: string;
    currency?: string;
    order?: number;
    adjustment_filter?: Record<string, string>;
}
