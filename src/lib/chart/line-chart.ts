import {
    SChart, SChartInterface, SettingsInterface, tooltips,
} from '@/lib/chart/s-chart';
import {
    Chart, ChartColor, Scriptable,
} from 'chart.js';
import Color from 'color';

interface SLineChartInterface extends SChartInterface {
    setGradientHeight: (...args) => SLineChartInterface;
    setBorderWidth: (...args) => SLineChartInterface;
    setFill: (...args) => SLineChartInterface;
    setMin: (...args) => SLineChartInterface;
    setMax: (...args) => SLineChartInterface;
    // setPointRadius: (...args) => SLineChartInterface;
    // setLineTension: (...args) => SLineChartInterface;
    // setBackgroundColor: (...args) => SLineChartInterface;
}

const lineChartSettings: SettingsInterface = {
    metaDatasets: {
        borderWidth: 1,
        fill: 'start',
        pointRadius: 0,
        pointBorderWidth: 0,
        lineTension: 0.25,
        // fill: false,
        // borderWidth: 2,
        // lineTension: 0,
        // pointRadius: 0,
    },
    options: {
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        layout: {
            padding: {
                left: -10,
                bottom: -10,
            },
        },
        scales: {
            yAxes: [{
                gridLines: {
                    display: false,
                },
                ticks: {
                    min: -20,
                    suggestedMax: 80,
                    display: false,
                },
            }],
            xAxes: [{
                gridLines: {
                    display: false,
                },
                ticks: {
                    display: false,
                },
            }],
        },
        tooltips,
        // maintainAspectRatio: false,
        // legend: {
        //     display: false,
        // },
        // scales: {
        //     yAxes: [{
        //         gridLines: {
        //             display: true,
        //             drawTicks: false,
        //             color: gray[100],
        //             zeroLineColor: gray[100],
        //         },
        //         ticks: {
        //             display: true,
        //             autoSkip: true,
        //             autoSkipPadding: 20,
        //             padding: 10,
        //         },
        //     }],
        //     xAxes: [{
        //         gridLines: {
        //             display: true,
        //             drawTicks: false,
        //             color: gray[100],
        //             zeroLineColor: gray[100],
        //         },
        //         ticks: {
        //             autoSkip: true,
        //             autoSkipPadding: 50,
        //             padding: 10,
        //         },
        //         afterTickToLabelConversion(scaleInstance): void {
        //             scaleInstance.ticks[0] = null;
        //             scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
        //         },
        //     }],
        // },
        // tooltips: {
        //     ...tooltips,
        //     mode: 'point',
        // },
    },
    plugins: [{}],
    // [{
    //     beforeInit(chart: SLineChart): void {
    //         const labels: (string | number | number[] | string[] | Date | Date[] | Moment | Moment[])[] | undefined = chart.data.labels;
    //         labels?.forEach((e, i, a) => {
    //             if (typeof e === 'string' && /\n/.test(e)) {
    //                 a[i] = e.split(/\n/);
    //             }
    //         });
    //     },
    // }]
};

export class SLineChart extends SChart implements SLineChartInterface {
     gradientHeight: number | undefined;

     constructor(canvas: HTMLCanvasElement, config: Chart.ChartConfiguration = {}) {
         super(canvas, SLineChart.initConfig('line', lineChartSettings, config));
         this.metaDatasets = {
             ...this.metaDatasets,
             ...lineChartSettings.metaDatasets,
             backgroundColor: this.getBackgroundColor,
         };
     }

     setGradientHeight(height: number): this {
         this.gradientHeight = height;
         return this;
     }

     setBorderWidth(width: number): this {
         this.metaDatasets.borderWidth = width;
         return this;
     }

     setFill(fill: boolean | number | string): this {
         this.metaDatasets.fill = fill;
         return this;
     }

     setMin(min: number): this {
         this.options.scales?.yAxes?.forEach((y) => {
             if (y.ticks) y.ticks.min = min;
             else y.ticks = { min };
         });
         return this;
     }

     setMax(max: number): this {
         this.options.scales?.yAxes?.forEach((y) => {
             if (y.ticks) y.ticks.max = max;
             else y.ticks = { max };
         });
         return this;
     }

     protected getBackgroundColor: Scriptable<ChartColor> = ({ dataIndex }): ChartColor => {
         const color = this.colors[dataIndex || 0];
         if (!this.gradientHeight) return color;
         const gradient = this.ctx?.createLinearGradient(0, 0, 0, this.gradientHeight);
         gradient?.addColorStop(0, Color(color).alpha(0.25));
         gradient?.addColorStop(0.5, Color(color).alpha(0.125));
         gradient?.addColorStop(1, Color(color).alpha(0));
         return gradient || color;
     }
}
