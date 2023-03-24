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

export interface JobTaskData {
    created_at: string;
    create_count: number;
    deleted_count: number;
    disconnected_count: number;
    domain_id: string;
    errors: JobTaskError[];
    failure_count: number;
    finished_at: string;
    job_id: string;
    job_task_id: string;
    project_id: string;
    provider: string;
    secret_id: string;
    service_account_id: string;
    started_at: string;
    status: string;
    updated_count: number;
}
