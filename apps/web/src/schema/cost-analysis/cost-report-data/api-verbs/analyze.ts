import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface CostReportDataAnalyzeParameters {
    query?: Query;
    cost_report_data_id: string;
    report_year?: string;
    report_month?: string;
    product?: string;
    provider?: string;
    data_source_id?: string;
    workspace_id?: string;
}
