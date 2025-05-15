import type { ReportAdjustmentMethod } from '@/api-clients/cost-analysis/report-adjustment/schema/type';


export interface ReportAdjustmentUpdateParameters {
    report_adjustment_id: string;
    name?: string;
    method?: ReportAdjustmentMethod;
    value?: number;
    description?: string;
    provider?: string;
    adjustment_filter?: Record<string, string>;
}
