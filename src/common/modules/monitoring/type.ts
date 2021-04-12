/* eslint-disable camelcase */
export interface Metric {
    key: string;
    name: string;
    unit: {
        x: string;
        y: string;
    };
    chart_type: string;
    chart_options: any;
}

export interface MonitoringResourceType {
    id: string;
    name?: string;
}

export interface MonitoringProps {
    loading?: boolean;
    resourceType: string;
    resources: MonitoringResourceType[];
    selectedMetrics?: Metric[];
    dataSourceId?: string;
    responsive?: boolean;
}
