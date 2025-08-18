export interface MonitoringMetricGetDataParameters {
    data_source_id: string;
    metric_query: Record<string, any>;
    metric: string; // metric key
    start: string;
    end: string;
    period?: number;
    stat?: 'AVERAGE' | 'MINIMUM' | 'MAXIMUM';
}
