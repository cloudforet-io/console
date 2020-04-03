import {
    abstractChartProps,
    AbstractChartPropsType,
    ChartOptionsType,
    ChartSettingsType,
    tooltips,
    ChartThemeGroupType,
    defaultPlugins,
} from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import { black, gray } from '@/styles/colors';

export const barChartProps = {
    ...abstractChartProps,
    type: {
        type: String,
        default: 'bar',
        validator(type: string): boolean {
            return ['bar', 'horizontalBar'].includes(type);
        },
    },
    styleType: {
        type: String,
        default: 'default',
        validator(style: string): boolean {
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

export interface BarChartPropsType extends AbstractChartPropsType {
    stacked: boolean;
    minBarLength: number;
}


/** *************** THEMES ****************** */


/** default */

const defaultSettings: ChartSettingsType<BarChartPropsType> = props => ({
    // barThickness: 8,
    borderWidth: 0,
    minBarLength: props.minBarLength,
    categoryPercentage: 0.5,
    barPercentage: 0.7,
});

const defaultOptions: ChartOptionsType<BarChartPropsType> = props => ({
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
                color: gray[100],
                zeroLineColor: gray[100],
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
                color: gray[100],
                zeroLineColor: gray[100],

            },
            ticks: {
                display: false,
            },
        }],
    },
    responsive: true,
    tooltips,
});

export const barChartThemes: ChartThemeGroupType<BarChartPropsType> = {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
};
