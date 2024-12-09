interface JobTaskErrorAdditional {
    cloud_service_group?: string;
    cloud_service_type?: string;
    domain_id?: string;
    provider?: string;
    resource_id?: string;
    resource_type?: string;
}

export interface JobTaskError {
    additional: JobTaskErrorAdditional;
    error_code: string;
    message: string;
    sequence?: number;
}

