export interface CostReportDataModal {
    cost_report_data_id: string;
    cost: Record<string, number>;
    cost_report_name: string;
    report_year: string;
    report_month: string;
    is_confirmed: boolean;
    provider: string;
    product: string;
    service_account_name: string;
    data_source_name: string;
    project_name: string;
    workspace_name: string;
    service_account_id: string;
    data_source_id: string;
    cost_report_id: string;
    cost_report_config_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
