import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';

export interface CostReportDataAnalyzeParameters {
    query?: AnalyzeQuery;
    cost_report_config_id?: string;
    is_confirmed?: boolean;
    product?: string;
    provider?: string;
    data_source_id?: string;
    cost_report_data_id?: string;
    workspace_id?: string;
}
