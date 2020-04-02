import { colorset } from '@/lib/util';
import { gray } from '@/styles/colors';
import Chart, { ChartOptions } from 'chart.js';
import {
    loadingChartProps,
    LoadingChartPropsType,
    OptionsType, PluginsType,
    SettingsType,
    tooltips,
} from '@/components/organisms/charts/loading-chart/LoadingChart.toolset';

export const lineChartProps = {
    ...loadingChartProps,
    type: {
        type: String,
        default: 'line',
    },
    styleType: {
        type: String,
        default: 'simple',
        validator(style: string) {
            return ['simple', 'multi'].includes(style);
        },
    },
    /**
     * It works when dataset has only one item
     */
    color: {
        type: String,
        default: '',
    },
    min: {
        type: Number,
        default: undefined,
    },
    max: {
        type: Number,
        default: undefined,
    },
    gradient: {
        type: Boolean,
        default: true,
    },
};

export interface LineChartPropsType extends LoadingChartPropsType {
    color?: string;
    min?: number;
    max?: number;
    gradient: boolean;
}

/** *************** Settings ****************** */
const simpleSettings: SettingsType<LineChartPropsType> = props => ({
    borderWidth: 1,
    fill: true,
    pointRadius: 0,
    lineTension: 0.5,

});

const multiSettings: SettingsType<LineChartPropsType> = props => ({
    fill: false,
    borderWidth: 2,
    lineTension: 0,
    pointRadius: 0,
});

export const settings = {
    simple: simpleSettings,
    multi: multiSettings,
};

/** *************** Options ****************** */


const simpleOptions: OptionsType<LineChartPropsType> = props => ({
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    layout: {
        padding: {
            left: 10,
            right: 10,
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

const multiOptions: OptionsType<LineChartPropsType> = props => ({
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

export const options = {
    simple: simpleOptions,
    multi: multiOptions,
};

/** *************** Plugins ****************** */

const simplePlugins: PluginsType<LineChartPropsType> = props => [{
}];

const multiPlugins: PluginsType<LineChartPropsType> = props => [{
    beforeInit(chart: Chart) {
        const labels: any = chart.data.labels;
        labels.forEach((e, i, a) => {
            if (/\n/.test(e)) {
                a[i] = e.split(/\n/);
            }
        });
    },
}];

export const plugins = {
    simple: simplePlugins,
    multi: multiPlugins,
};
