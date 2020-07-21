import { Timestamp } from '@/components/util/type';

export const metricChartProps = {
    loading: {
        type: Boolean,
        default: true,
    },
    dataset: {
        type: Object,
        default: () => ({}),
    },
    labels: {
        type: Array,
        default: () => [],
    },
    colors: {
        type: Array,
        default: () => [],
    },
    unit: {
        type: Object,
        default: () => ({ x: 'Timestamp', y: 'Count' }),
        validator(unit) {
            return typeof unit.x === 'string' && typeof unit.y === 'string';
        },
    },
    timezone: {
        type: String,
        default: 'UTC',
    },
    title: {
        type: String,
        default: '',
    },
    error: {
        type: Boolean,
        default: false,
    },
};

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
