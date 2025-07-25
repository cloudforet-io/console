export interface MonitoringMetricModel {
    key: string;
    name: string;
    group?: string;
    unit?: string;
    metric_query?: Record<string, any>;
}

export interface MonitoringMetricListModel {
    metrics: MonitoringMetricModel[];
    available_resources: Record<string, any>;
}

export interface MonitoringMetricGetDataModel {
    labels: string[];
    values: Record<string, any>;
}
