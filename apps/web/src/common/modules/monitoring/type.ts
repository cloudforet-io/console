export interface Metric {
    key: string;
    name: string;
    unit: {
        x: string;
        y: string;
    };
    metric_query: any;
}

export interface MonitoringResourceType {
    id: string;
    name?: string;
    provider: string;
}

export interface MonitoringProps {
    loading?: boolean;
    resources: MonitoringResourceType[];
    selectedMetrics?: Metric[];
    dataSourceId?: string;
    responsive?: boolean;
}


export interface MetricChartData {
    loading: boolean;
    labels: string[];
    dataset: {[resourceKey: string]: number[]};
    metric: Metric;
    error?: boolean;
    resources: any[];
}

export interface AvailableResource {
    id: string;
    name: string;
    color: string;
    link: string;
}

export interface StatItem {
    type: string;
    label: string;
    name: string;
}
