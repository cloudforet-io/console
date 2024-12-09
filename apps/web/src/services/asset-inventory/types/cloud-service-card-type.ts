export interface CloudServiceAnalyzeResultResource {
    value?: number;
    cloud_service_type?: string;
}
export interface CloudServiceAnalyzeResult {
    provider?: string;
    cloud_service_group?: string;
    resources?: CloudServiceAnalyzeResultResource[]
}
