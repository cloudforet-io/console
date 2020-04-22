import { isNotEmpty } from '@/lib/util';

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
};

export interface MetricChartProps {
    loading: boolean;
    dataset: {
        [key: string]: number[];
    };
    labels: string[];
    colors: string[];
    unit: { x: string; y: string };
}
