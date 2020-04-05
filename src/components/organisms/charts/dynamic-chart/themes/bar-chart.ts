import { black, gray } from '@/styles/colors';
import {
    ChartOptionsType, ChartPluginsType,
    ChartSettingsType, ChartThemeGroupType, defaultThemeProps,
    DefaultThemePropsType, tooltips,
} from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import _ from 'lodash';
import Chart from 'chart.js';

/** *************** default ****************** */
export interface BarDefaultThemePropsType extends DefaultThemePropsType {
    stacked: boolean;
    minBarLength: number;
    horizontal?: boolean;
    ticksCount: number;
}

export const barDefaultThemeProps = {
    ...defaultThemeProps,
    stacked: false,
    minBarLength: 50,
    horizontal: false,
    ticksCount: 5,
} as BarDefaultThemePropsType;


const defaultSettings: ChartSettingsType<BarDefaultThemePropsType> = (themeProps) => {
    const categoryPercentage = themeProps.horizontal ? 0.75 : 0.5;
    const barPercentage = themeProps.horizontal ? 0.7 : 0.8;
    return i => ({
        // barThickness: 8,
        borderWidth: 0,
        // minBarLength: themeProps.minBarLength,
        categoryPercentage,
        barPercentage,
    });
};

const defaultOptions: ChartOptionsType<BarDefaultThemePropsType> = (themeProps, dataset) => {
    const max: number = themeProps.stacked
        ? _.max(_.reduceRight(dataset, (res: any, ds) => {
            ds.data.forEach((d, i) => {
                res[i] = res[i] + d || d;
            });
            return res;
        }, [])) as number
        : _.max(dataset.map(ds => _.max(ds.data))) as number;
    const stepSize = Math.floor(max / themeProps.ticksCount);

    const xAxes = [{
        stacked: themeProps.stacked,
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
    }];

    const yAxes = [{
        stacked: themeProps.stacked,
        gridLines: {
            drawTicks: false,
            drawBorder: false,
            color: gray[100],
            zeroLineColor: gray[100],
        },
        ticks: {
            display: false,
            beginAtZero: true,
            // max,
            stepSize: (max / themeProps.ticksCount),
            max: stepSize * themeProps.ticksCount,
        },
    }];
    return {
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        scales: {
            yAxes: themeProps.horizontal ? xAxes : yAxes,
            xAxes: themeProps.horizontal ? yAxes : xAxes,
        },
        responsive: true,
        tooltips,
    };
};

const defaultPlugins: ChartPluginsType<BarDefaultThemePropsType> = themeProps => [{
    beforeDraw(chart) {
        const ctx = chart.chart.ctx;

        ctx.save();

        ctx.strokeStyle = gray[100];
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(chart.chartArea.right, chart.chartArea.top);
        ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom);
        ctx.stroke();

        ctx.restore();
    },
}];

export type BarTheme = ChartThemeGroupType<
    BarDefaultThemePropsType>

export default {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
} as BarTheme;
