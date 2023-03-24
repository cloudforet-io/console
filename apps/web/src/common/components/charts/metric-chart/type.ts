export interface MonitoringResourceType {
    id: string;
    name?: string;
    color?: string;
}

export interface Unit { x: string; y: string }

export interface MetricChartProps {
    loading: boolean;
    dataset: Record<string, number[]>;
    labels: string[];
    resources: Array<MonitoringResourceType>;
    unit: Unit;
    timezone: string;
    title: string;
    error?: boolean;
}
