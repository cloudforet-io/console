import {
    loadingChartProps,
    LoadingChartPropsType, OptionsType, PluginsType, SettingsType, tooltips,
} from '@/components/organisms/charts/loading-chart/LoadingChart.toolset';
import { black, gray3 } from '@/styles/colors';

export const barChartProps = {
    ...loadingChartProps,
    type: {
        type: String,
        default: 'bar',
    },
    styleType: {
        type: String,
        default: 'default',
        validator(style: string) {
            return ['default'].includes(style);
        },
    },
    stacked: {
        type: Boolean,
        default: false,
    },
    minBarLength: {
        type: Number,
        default: 50,
    },
};

export interface BarChartPropsType extends LoadingChartPropsType {
    stacked: boolean;
    minBarLength: number;
}


/** *************** Settings ****************** */
const defaultSettings: SettingsType<BarChartPropsType> = props => ({
    // barThickness: 8,
    borderWidth: 0,
    minBarLength: props.minBarLength,
    categoryPercentage: 0.5,
    barPercentage: 0.7,
});

export const settings = {
    default: defaultSettings,
};

/** *************** Options ****************** */

const defaultOptions: OptionsType<BarChartPropsType> = props => ({
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        yAxes: [{
            stacked: props.stacked,
            gridLines: {
                drawTicks: false,
                drawBorder: false,
                color: gray3,
                zeroLineColor: gray3,
            },
            ticks: {
                padding: 10,
                fontColor: black,
            },
        }],
        xAxes: [{
            stacked: props.stacked,
            gridLines: {
                drawTicks: false,
                drawBorder: false,
                color: gray3,
                zeroLineColor: gray3,

            },
            ticks: {
                display: false,
            },
        }],
    },
    responsive: true,
    tooltips,
});


export const options = {
    default: defaultOptions,
};

/** *************** Plugins ****************** */

const defaultPlugins: PluginsType<BarChartPropsType> = props => [{
}];

export const plugins = {
    default: defaultPlugins,
};
