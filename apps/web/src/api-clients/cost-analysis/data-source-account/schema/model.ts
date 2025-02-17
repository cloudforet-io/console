
export interface CostDataSourceAccountModel {
    account_id: string;
    data_source_id: string;
    name: string;
    is_sync: boolean;
    is_linked: boolean;
    v_service_account_id: string;
    v_project_id: string;
    v_workspace_id: string;
    service_account_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
    synced_at: string;
}

export interface CostDataSourceAnalyzeModel {
    [groupBy: string]: string | any;
}
