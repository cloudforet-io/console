import {
    SChart, SettingsInterface, tooltips,
} from '@/lib/chart/s-chart';
import {
    ChartColor, ChartConfiguration, Scriptable,
} from 'chart.js';
import { black, gray } from '@/styles/colors';
import _ from 'lodash';

interface SBarChartInterface {
    ticksCount: number | undefined;
    stacked: boolean;
    gridColor: string;
    setCategoryPercentage: (...args) => SBarChartInterface;
    setBarPercentage: (...args) => SBarChartInterface;
    setTicksCount: (...args) => SBarChartInterface;
    setGridColor: (...args) => SBarChartInterface;
}

const barChartSettings: SettingsInterface = {
    metaDatasets: {
        borderWidth: 0,
        categoryPercentage: 0.5,
        barPercentage: 0.8,
    },
    options: {
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        responsive: true,
        tooltips,
        scales: {
            yAxes: [{
                gridLines: {
                    drawTicks: false,
                    drawBorder: false,
                    color: gray[100],
                    zeroLineColor: gray[100],
                },
                ticks: {
                    display: false,
                    beginAtZero: true,
                },
            }],
            xAxes: [{
                gridLines: {
                    drawTicks: false,
                    drawBorder: false,
                    color: gray[100],
                    zeroLineColor: gray[100],
                },
                ticks: {
                    padding: 10,
                    fontColor: black,
                },
            }],
        },
    },
    plugins: [{
        beforeDraw(chart: SBarChart): void {
            const ctx: CanvasRenderingContext2D | null = chart.ctx;
            if (!ctx) return;

            ctx.save();

            ctx.strokeStyle = chart.gridColor;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(chart.chartArea.left, chart.chartArea.bottom);
            ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom);
            ctx.moveTo(chart.chartArea.right, chart.chartArea.top);
            ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom);
            ctx.stroke();

            ctx.restore();
        },
    }],
};

export class SBarChart extends SChart implements SBarChartInterface {
    ticksCount: number | undefined;

    stacked: boolean;

    gridColor: string;

    static initConfig(type: string, settings: SettingsInterface, config: ChartConfiguration): ChartConfiguration {
        const newConfig = {
            type,
            ..._.cloneDeep(settings),
            ...config,
        };
        if (newConfig.type === 'horizontalBar') {
            const y = _.get(newConfig, 'options.scales.yAxes');
            _.set(newConfig, 'options.scales.yAxes', _.get(newConfig, 'options.scales.xAxes'));
            _.set(newConfig, 'options.scales.xAxes', y);
        }
        console.log('initConfig', newConfig);
        return newConfig;
    }

    constructor(canvas: HTMLCanvasElement, config: ChartConfiguration = {}) {
        super(canvas, SBarChart.initConfig('bar', barChartSettings, config));

        this.metaDatasets = {
            ...this.metaDatasets,
            ...barChartSettings.metaDatasets,
            backgroundColor: this.getBackgroundColor,
            borderColor: this.getBorderColor,
        };
        this.stacked = false;
        this.gridColor = gray[100];
    }

    setCategoryPercentage(categoryPercentage: number): this {
        this.metaDatasets.categoryPercentage = categoryPercentage;
        return this;
    }

    setBarPercentage(barPercentage: number): this {
        this.metaDatasets.barPercentage = barPercentage;
        return this;
    }

    setStacked(stacked: boolean): this {
        this.stacked = stacked;
        this.options.scales?.yAxes?.forEach((axe, i, origin) => {
            _.set(origin[i], 'stacked', stacked);
        });
        this.options.scales?.xAxes?.forEach((axe, i, origin) => {
            _.set(origin[i], 'stacked', stacked);
        });
        return this;
    }

    setTicksCount(count: number | undefined): this {
        this.ticksCount = count;
        return this;
    }

    setGridColor(color: string): this {
        this.gridColor = color;
        this.options.scales?.yAxes?.forEach((axe, i, origin) => {
            _.set(origin[i], 'gridLines.color', color);
            _.set(origin[i], 'gridLines.zeroLineColor', color);
        });
        this.options.scales?.xAxes?.forEach((axe, i, origin) => {
            _.set(origin[i], 'gridLines.color', color);
            _.set(origin[i], 'gridLines.zeroLineColor', color);
        });
        return this;
    }

    protected setAutoTicks(): void {
        const max: number = this.stacked
            ? _.max(_.reduceRight(this.data.datasets, (res: number[], ds) => {
                ds.data?.forEach((d, i) => {
                    res[i] = res[i] + d || d;
                });
                return res;
            }, [])) as number
            : _.max(this.data.datasets?.map((ds) => {
                if (ds.data) return _.max(ds.data as number[]);
                return 0;
            })) as number;
        const stepSize = Math.floor(max / (this.ticksCount || max));
        const axes = this.config.type === 'horizontalBar'
            ? _.get(this, 'options.scales.xAxes', [])
            : _.get(this, 'options.scales.yAxes', []);
        axes.forEach((axe, i, origin) => {
            _.set(origin[i], 'ticks.stepSize', stepSize);
            _.set(origin[i], 'ticks.max', max);
        });
    }

    protected changeAxes(): void {
        const y = _.get(this, 'options.scales.yAxes');
        _.set(this, 'options.scales.yAxes', _.get(this, 'options.scales.yAxes'));
        _.set(this, 'options.scales.xAxes', y);
    }


    protected getBackgroundColor: Scriptable<ChartColor> =
        ({ datasetIndex }): ChartColor => this.colors[datasetIndex || 0]

    protected getBorderColor: Scriptable<ChartColor> =
        (): ChartColor => this.colors

    apply(): this {
        this.data.datasets = this.data.datasets?.map(ds => ({ ...ds, ...this.metaDatasets }));
        if (this.ticksCount) this.setAutoTicks();
        this.update();
        return this;
    }
}
