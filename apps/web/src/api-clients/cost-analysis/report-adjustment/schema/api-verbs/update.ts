import type { ReportAdjustmentUnit } from '@/api-clients/cost-analysis/report-adjustment/schema/type';


export interface ReportAdjustmentUpdateParameters {
    report_adjustment_id: string;
    name?: string;
    unit?: ReportAdjustmentUnit;
    value?: number;
    description?: string;
    provider?: string;
    adjustment_filter?: Record<string, string>;
}
