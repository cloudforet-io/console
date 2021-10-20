import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import {
    reactive,
} from '@vue/composition-api';

import { DynamicChartStateArgs } from '@/common/composables/dynamic-chart/type';
import { drawStackedColumnChart } from '@/common/composables/dynamic-chart/draw-stacked-column-chart';
import { drawColumnChart } from '@/common/composables/dynamic-chart/draw-column-chart';
import { drawLineChart } from '@/common/composables/dynamic-chart/draw-line-chart';
import { drawStackedLineChart } from '@/common/composables/dynamic-chart/draw-stacked-line-chart';
import { drawPieChart } from '@/common/composables/dynamic-chart/draw-pie-chart';
import {
    blue, coral, gray, green, indigo, peacock, violet, yellow,
} from '@/styles/colors';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';


export const CUSTOM_COLORS = [
    coral[500], blue[500], violet[500], yellow[600], green[400], coral[400], peacock[600], coral[700],
    peacock[400], green[700], green[500], blue[400], indigo[700], violet[400], indigo[400], blue[700],
];
const customColorTheme = (target) => {
    if (target instanceof am4core.ColorSet) {
        target.list = CUSTOM_COLORS.map(d => am4core.color(d));
    }
};

am4core.useTheme(customColorTheme);
am4core.useTheme(am4themesAnimated);
am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = 'CostAnalysisChart';


type ToggleSeries = (chart: XYChart | PieChart, index: number) => void;
type HideAllSeries = (chart: XYChart | PieChart) => void;

export const toggleSeries: ToggleSeries = (chart, index) => {
    if (chart instanceof PieChart) {
        const series = (chart as PieChart).series.getIndex(0);
        if (!series) return;

        const slice = series.slices.values[index];
        if (!slice || !slice.dataItem) return;

        if (slice.isHiding || slice.isHidden) {
            slice.dataItem.show();
        } else {
            slice.dataItem.hide();
        }
    } else {
        const series = (chart as XYChart).series.getIndex(index);
        if (!series) return;
        if (series.isHiding || series.isHidden) {
            series.show();
        } else {
            series.hide();
        }
    }
};
export const hideAllSeries: HideAllSeries = (chart) => {
    if (chart instanceof PieChart) {
        const series = chart.series.getIndex(0);
        if (!series) return;
        const slices = series.slices.values;
        slices.forEach((slice) => {
            if (slice.dataItem) slice.dataItem.hide();
        });
    } else {
        const series = chart.series.values;
        series.forEach((d) => {
            d.hide();
        });
    }
};

const createCursor = (chart) => {
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.maxTooltipDistance = 20;
    chart.cursor.lineX.stroke = am4core.color(gray[900]);
    chart.cursor.lineX.strokeDasharray = '';
    chart.cursor.lineX.strokeOpacity = 1;
    chart.cursor.lineY.stroke = am4core.color(gray[900]);
    chart.cursor.lineY.strokeDasharray = '';
    chart.cursor.lineY.strokeOpacity = 1;
};

export const useColumnChart = ({
    data, valueOptions, categoryOptions, chartContainer,
}: DynamicChartStateArgs) => {
    const state = reactive({
        data, valueOptions, categoryOptions, chartContainer,
    });

    const chart = drawColumnChart(state.data, state.chartContainer, state.valueOptions, state.categoryOptions);
    createCursor(chart);

    return {
        chart,
    };
};

export const useStackedColumnChart = ({
    data, valueOptions, categoryOptions, chartContainer,
}: DynamicChartStateArgs) => {
    const state = reactive({
        data, valueOptions, categoryOptions, chartContainer,
    });

    const chart = drawStackedColumnChart(state.data, state.chartContainer, state.valueOptions, state.categoryOptions);
    createCursor(chart);

    return {
        chart,
    };
};

export const useLineChart = ({
    data, valueOptions, categoryOptions, chartContainer,
}: DynamicChartStateArgs) => {
    const state = reactive({
        data, valueOptions, categoryOptions, chartContainer,
    });

    const chart = drawLineChart(state.data, state.chartContainer, state.valueOptions, state.categoryOptions);
    createCursor(chart);

    return {
        chart,
    };
};

export const useStackedLineChart = ({
    data, valueOptions, categoryOptions, chartContainer,
}: DynamicChartStateArgs) => {
    const state = reactive({
        data, valueOptions, categoryOptions, chartContainer,
    });

    const chart = drawStackedLineChart(state.data, state.chartContainer, state.valueOptions, state.categoryOptions);
    createCursor(chart);

    return {
        chart,
    };
};

export const usePieChart = ({
    data, valueOptions, categoryOptions, chartContainer,
}: DynamicChartStateArgs) => {
    const state = reactive({
        data, valueOptions, categoryOptions, chartContainer,
    });

    const chart = drawPieChart(state.data, state.chartContainer);

    return {
        chart,
    };
};
