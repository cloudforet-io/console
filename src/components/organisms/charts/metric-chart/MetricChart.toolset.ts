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
};

export interface MetricChartProps {
    loading: boolean;
    dataset: {
        [key: string]: number[];
    };
    labels: string[];
    colors: string[];
}
