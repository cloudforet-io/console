import { white } from '@/styles/colors';
import {
    ChartOptionsType,
    ChartSettingsType, ChartThemeGroupType, defaultPlugins, defaultThemeProps,
    DefaultThemePropsType, tooltips,
} from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';


export type PieDefaultThemePropsType = DefaultThemePropsType

export const pieDefaultThemeProps = {
    ...defaultThemeProps,
} as PieDefaultThemePropsType;


const defaultSettings: ChartSettingsType<PieDefaultThemePropsType> = (themeProps, chartRef, i) => ({
    borderWidth: 2,
    borderColor: white,
    backgroundColor: themeProps.colors,
});

const defaultOptions: ChartOptionsType<PieDefaultThemePropsType> = themeProps => ({
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

export type PieTheme = ChartThemeGroupType<
    PieDefaultThemePropsType>

export default {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
} as PieTheme;
