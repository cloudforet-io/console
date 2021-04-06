import { Timestamp } from '@spaceone/design-system/dist/src/util/type';


interface MonitoringResourceType {
    id: string;
    name?: string;
    color?: string;
}

export interface MetricChartProps {
    loading: boolean;
    dataset: {
        [key: string]: number[];
    };
    labels: Array<Timestamp|string>;
    resources: Array<MonitoringResourceType>;
    unit: { x: string; y: string };
    timezone: string;
    title: string;
    error?: boolean;
}
