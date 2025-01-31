import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface CostReportDataListParameters {
    query?: Query;
    cost_report_data_id?: string;
    cost_report_config_id?: string;
    cost_report_id?: string;
    product?: string;
    provider?: string;
    is_confirmed?: boolean;
    data_source_id?: string;
    workspace_id?: string;
}
