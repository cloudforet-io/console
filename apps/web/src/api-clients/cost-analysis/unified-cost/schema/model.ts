export interface UnifiedCostModel {
    unified_cost_id: string;
    cost: {
        KRW: number;
        USD: number;
        JPY: number;
    };
    billed_month: string;
    billed_year: string;
    aggregation_date: string;
    exchange_date: string;
    exchange_source: string;
    currency: string;
    is_confirmed: boolean;
    provider: string;
    region_code: string;
    region_key: string;
    product: string;
    usage_type: string;
    usage_unit: string;
    service_account_name: string;
    data_source_name: string;
    project_name: string;
    workspace_name: string;
    service_account_id: string;
    data_source_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
