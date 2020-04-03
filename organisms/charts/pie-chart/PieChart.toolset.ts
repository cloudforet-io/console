import {
    abstractChartProps,
    AbstractChartPropsType,
    ChartOptionsType,
    ChartSettingsType,
    tooltips, ChartThemeGroupType, defaultPlugins,
} from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import { white } from '@/styles/colors';

export const pieChartProps = {
    ...abstractChartProps,
    type: {
        type: String,
        default: 'doughnut',
        validator(type: string): boolean {
            return ['doughnut', 'pie'].includes(type);
        },
    },
    styleType: {
        type: String,
        default: 'default',
        validator(style: string): boolean {
            return ['default'].includes(style);
        },
    },
};

export type PieChartPropsType = AbstractChartPropsType


/** *************** THEMES ****************** */


/** default */

const defaultSettings: ChartSettingsType<PieChartPropsType> = (props, chartRef, i) => ({
    borderWidth: 2,
    borderColor: white,
    backgroundColor: props.colors,
});

const defaultOptions: ChartOptionsType<PieChartPropsType> = props => ({
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


export const pieChartThemes: ChartThemeGroupType<PieChartPropsType> = {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
};
