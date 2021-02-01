import { Timestamp } from '@/util/type';

export interface MetricChartProps {
    loading: boolean;
    dataset: {
        [key: string]: number[];
    };
    labels: Array<Timestamp|string>;
    colors: string[];
    unit: { x: string; y: string };
    timezone: string;
    title: string;
    error?: boolean;
}
