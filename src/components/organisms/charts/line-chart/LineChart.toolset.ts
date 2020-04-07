import { gray } from '@/styles/colors';
import Chart, { ChartDataSets } from 'chart.js';
import {
    abstractChartProps,
    AbstractChartPropsType,
    ChartOptionsType, ChartPluginsType,
    ChartSettingsType,
    tooltips, ChartThemeGroupType, defaultPlugins,
} from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import Color from 'color';

export const lineChartProps = {
    ...abstractChartProps,
    type: {
        type: String,
        default: 'line',
        validator(type: string): boolean {
            return ['line'].includes(type);
        },
    },
    styleType: {
        type: String,
        default: 'default',
        validator(style: string): boolean {
            return ['default', 'multi'].includes(style);
        },
    },
    min: {
        type: Number,
        default: undefined,
    },
    max: {
        type: Number,
        default: undefined,
    },
    gradientHeight: {
        type: Number,
        default: undefined,
    },
};

export interface LineChartPropsType extends AbstractChartPropsType {
    min?: number;
    max?: number;
    gradientHeight?: number;
}

/** *************** THEMES ****************** */


/** default */
const getGradientColor = (color: string, chartRef: HTMLCanvasElement, gradientHeight: number) => {
    const ctx: CanvasRenderingContext2D = chartRef.getContext('2d') as CanvasRenderingContext2D;
    const gradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
    gradient.addColorStop(0, Color(color).alpha(0.25));
    gradient.addColorStop(0.5, Color(color).alpha(0.125));
    gradient.addColorStop(1, Color(color).alpha(0));
    return gradient;
};

const defaultSettings: ChartSettingsType<LineChartPropsType> = (props, chartRef, i): ChartDataSets => ({
    borderWidth: 1,
    fill: true,
    pointRadius: 0,
    lineTension: 0.5,
    backgroundColor: getGradientColor(props.colors[i], chartRef, props.gradientHeight || 100),
});

const defaultOptions: ChartOptionsType<LineChartPropsType> = props => ({
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
                beginAtZero: true,
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
});

/** multi */

const multiSettings: ChartSettingsType<LineChartPropsType> = props => ({
    fill: false,
    borderWidth: 2,
    lineTension: 0,
    pointRadius: 0,
});

const multiOptions: ChartOptionsType<LineChartPropsType> = props => ({
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        yAxes: [{
            gridLines: {
                display: true,
                drawTicks: false,
                color: gray[100],
                zeroLineColor: gray[100],
            },
            ticks: {
                display: true,
                autoSkip: true,
                autoSkipPadding: 20,
                padding: 10,
                min: props.min,
                max: props.max,
            },
        }],
        xAxes: [{
            gridLines: {
                display: true,
                drawTicks: false,
                color: gray[100],
                zeroLineColor: gray[100],
            },
            ticks: {
                autoSkip: true,
                autoSkipPadding: 50,
                padding: 10,
            },
            afterTickToLabelConversion(scaleInstance) {
                scaleInstance.ticks[0] = null;
                scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
            },
        }],
    },
    tooltips: {
        ...tooltips,
        mode: 'point',
    },
});

const multiPlugins: ChartPluginsType<LineChartPropsType> = props => [{
    beforeInit(chart: Chart) {
        const labels: any = chart.data.labels;
        labels.forEach((e, i, a) => {
            if (/\n/.test(e)) {
                a[i] = e.split(/\n/);
            }
        });
    },
}];


export const lineChartThemes: ChartThemeGroupType<LineChartPropsType> = {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
    multi: {
        settings: multiSettings,
        options: multiOptions,
        plugins: multiPlugins,
    },
};
