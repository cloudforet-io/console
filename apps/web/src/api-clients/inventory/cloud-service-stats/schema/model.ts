export interface CloudServiceStatModel {
    query_set_id: string;
    data: Record<string, any>;
    unit: Record<string, any>;
    provider: string;
    cloud_service_group: string;
    cloud_service_type: string;
    region_code: string;
    account: string;
    additional_info: object;
    domain_id: string;
    workspace_id: string;
    project_id: string;
    created_date: string;
}
