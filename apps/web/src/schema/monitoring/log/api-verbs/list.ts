export interface MonitoringLogListParameters {
    data_source_id: string;
    resource_id: string;
    keyword?: string;
    start: string;
    end: string;
    sort?: Record<string, any>;
    limit?: number;
}
