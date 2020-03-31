export class LineChartData {
    label: string;

    data: number[];

    constructor(label: string, data: number[]) {
        this.label = label;
        this.data = data;
    }
}

type styleTypes = 'simple' | 'multi';


export interface LineChartPropsType {
    labels: any[];
    dataset: LineChartData[];
    color?: string;
    styleType: styleTypes;
    loading: boolean;
}

export const lineChartProps = {
    /**
     * This is for X axes
     */
    labels: {
        type: Array,
        default: () => [],
    },
    dataset: {
        type: Array,
        default: () => [],
    },
    /**
     * It works when dataset has only one item
     */
    color: {
        type: String,
        default: '',
    },
    styleType: {
        type: String,
        default: 'simple',
        validator(style: string) {
            return ['simple', 'multi'].includes(style);
        },
    },
    loading: {
        type: Boolean,
        default: true,
    },
};
