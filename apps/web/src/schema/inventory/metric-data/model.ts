export interface MetricDataModel {
    metric_id: string;
    value: number;
    unit: string;
    labels: object;
    namespace_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    created_year: string;
    created_month: string;
    created_date: string;
}
