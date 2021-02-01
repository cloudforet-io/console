import {
    Chart, ChartConfiguration, ChartDataSets, ChartPoint, ChartTooltipOptions,
} from 'chart.js';
import { gray } from '@/styles/colors';

export class PChart extends Chart {
    globalDatasets: ChartDataSets = {};

    // @ts-ignore
    constructor(canvas: HTMLCanvasElement, config: ChartConfiguration, globalDatasets: ChartDataSets = {}) {
        if (config.data?.datasets) {
            config.data.datasets = config.data.datasets.map((ds, i) => ({ ...globalDatasets, ...ds }));
        }

        super(canvas, config);

        this.globalDatasets = globalDatasets;
    }

    setLabels(labels: string[] | string[][], render = false): this {
        this.data.labels = labels;
        if (render) this.update();
        return this;
    }

    addData(data: Array<number | null | undefined> | ChartPoint[], label?: string, render = false): this {
        if (!this.data.datasets) this.data.datasets = [];
        this.data.datasets.push({
            label,
            data,
        });
        if (render) this.update();
        return this;
    }

    upsertData(data: Array<number | null | undefined> | ChartPoint[], label: string, render = false): this {
        const exist = this.data.datasets?.some((ds) => {
            if (ds.label === label) {
                ds.data = data;
            }
            return ds.label === label;
        });
        if (!exist) this.addData(data, label);
        if (render) this.update();
        return this;
    }

    apply(): this {
        this.data.datasets = this.data.datasets?.map((ds, i) => ({ ...ds, ...this.globalDatasets }));
        this.update();
        return this;
    }
}

export const tooltips: ChartTooltipOptions = {
    cornerRadius: 2,
    caretSize: 6,
    caretPadding: 8,
    displayColors: false,
    backgroundColor: gray[900],
};
