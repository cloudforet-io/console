import {
    reactive,
} from '@vue/composition-api';
import { DynamicChartStateArgs } from '@/common/composables/dynamic-chart/type';
import { drawStackedColumnChart } from '@/common/composables/dynamic-chart/draw-stacked-column-chart';
import { drawColumnChart } from '@/common/composables/dynamic-chart/draw-column-chart';
import { drawLineChart } from '@/common/composables/dynamic-chart/draw-line-chart';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { gray } from '@/styles/colors';
import { drawStackedLineChart } from '@/common/composables/dynamic-chart/draw-stacked-line-chart';
import { drawPieChart } from '@/common/composables/dynamic-chart/draw-pie-chart';


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
