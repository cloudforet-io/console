import { white, black } from '@/styles/colors';
import {
    ChartData,
    ChartOptionsType, ChartPluginsType,
    ChartSettingsType, ChartThemeGroupType, defaultThemeProps,
    DefaultThemePropsType, tooltips,
} from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import { ChartDataSets, ChartOptions } from 'chart.js';
import _ from 'lodash';

export interface PieDefaultThemePropsType extends DefaultThemePropsType {
    center: boolean;
    centerColor?: string;
    centerFontStyle?: string;
}

export const pieDefaultThemeProps = {
    ...defaultThemeProps,
    center: true,
} as PieDefaultThemePropsType;


const defaultSettings: ChartSettingsType<PieDefaultThemePropsType> = (themeProps, chartRef, dataset) => {
    const isNoData = dataset.every(ds => ds.data.every(d => d === 0));

    return (i) => {
        const settings: ChartDataSets = {
            borderWidth: 2,
            borderColor: white,
            backgroundColor: themeProps.colors,
        };
        if (isNoData) settings.data = dataset[i].data.map(() => 1);
        return settings;
    };
};

const defaultOptions: ChartOptionsType<PieDefaultThemePropsType> = (themeProps, dataset) => {
    const isNoData = dataset.every(ds => ds.data.every(d => d === 0));
    const options: ChartOptions = {
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
        tooltips: isNoData ? { enabled: false } : tooltips,
    };
    return options;
};

const defaultPlugins: ChartPluginsType<PieDefaultThemePropsType> = (themeProps, dataset) => {
    const totalCount = _.sumBy(dataset, ds => _.sum(ds.data));
    return [{
        beforeDraw(chart) {
            if (!themeProps.center) return;

            const ctx = chart.chart.ctx;

            const fontStyle = themeProps.centerFontStyle || 'Roboto';
            const color = themeProps.centerColor || black;

            ctx.font = `2rem ${fontStyle}`;

            const txt = totalCount;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
            const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
            ctx.fillStyle = color;

            // Draw text in center
            ctx.fillText(txt, centerX, centerY);
        },
    }];
};

export type PieTheme = ChartThemeGroupType<
    PieDefaultThemePropsType>

export default {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
} as PieTheme;
