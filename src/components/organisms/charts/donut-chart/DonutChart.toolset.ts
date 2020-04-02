import {
    loadingChartProps,
    LoadingChartPropsType,
    OptionsType,
    PluginsType,
    SettingsType,
    tooltips,
} from '@/components/organisms/charts/loading-chart/LoadingChart.toolset';
import { gray } from '@/styles/colors';
import Chart from 'chart.js';

export const donutChartProps = {
    ...loadingChartProps,
    type: {
        type: String,
        default: 'doughnut',
    },
    styleType: {
        type: String,
        default: 'default',
        validator(style: string) {
            return ['default'].includes(style);
        },
    },
};

export type DonutChartPropsType = LoadingChartPropsType

/** *************** Settings ****************** */
const defaultSettings: SettingsType<DonutChartPropsType> = props => ({
    borderWidth: 2,
});

export const settings = {
    default: defaultSettings,
};

/** *************** Options ****************** */

const defaultOptions: OptionsType<DonutChartPropsType> = props => ({
    maintainAspectRatio: false,
    layout: {
        padding: {
            left: 0,
            right: 10,
            top: 10,
            bottom: 0,
        },
    },
    legend: {
        display: false,
    },
    scales: {
        yAxes: [{
            gridLines: {
                display: false,
            },
            ticks: {
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
    elements: {
        arc: {
            borderWidth: 0,
        },
    },
    responsive: true,
    cutoutPercentage: 65,
    aspectRatio: 1,
    tooltips,
});


export const options = {
    default: defaultOptions,
};

/** *************** Plugins ****************** */

const defaultPlugins: PluginsType<DonutChartPropsType> = props => [{
}];

export const plugins = {
    default: defaultPlugins,
};
