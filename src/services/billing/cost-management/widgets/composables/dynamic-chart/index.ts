import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import {
    reactive,
} from '@vue/composition-api';

import { DynamicChartStateArgs } from '@/services/billing/cost-management/widgets/composables/dynamic-chart/type';
import drawStackedColumnChart from '@/services/billing/cost-management/widgets/composables/dynamic-chart/draw-stacked-column-chart';
import drawColumnChart from '@/services/billing/cost-management/widgets/composables/dynamic-chart/draw-column-chart';
import drawLineChart from '@/services/billing/cost-management/widgets/composables/dynamic-chart/draw-line-chart';
import drawStackedLineChart from '@/services/billing/cost-management/widgets/composables/dynamic-chart/draw-stacked-line-chart';
import drawPieChart from '@/services/billing/cost-management/widgets/composables/dynamic-chart/draw-pie-chart';

import {
    gray,
} from '@/styles/colors';

import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';


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

/* hooks */
const useColumnChart = ({
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

const useStackedColumnChart = ({
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

const useLineChart = ({
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

const useStackedLineChart = ({
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

const usePieChart = ({
    data, valueOptions, categoryOptions, chartContainer,
}: DynamicChartStateArgs) => {
    const state = reactive({
        data, valueOptions, categoryOptions, chartContainer,
    });

    const chart = drawPieChart(state.data, state.chartContainer, state.valueOptions, state.categoryOptions);

    return {
        chart,
    };
};

/* export hook */
export const useDynamicChart = (chartType: CHART_TYPE, params: DynamicChartStateArgs) => {
    let chart: XYChart|PieChart;
    if (chartType === CHART_TYPE.STACKED_COLUMN) {
        ({ chart } = useStackedColumnChart(params));
    } else if (chartType === CHART_TYPE.COLUMN) {
        ({ chart } = useColumnChart(params));
    } else if (chartType === CHART_TYPE.LINE) {
        ({ chart } = useLineChart(params));
    } else if (chartType === CHART_TYPE.STACKED_LINE) {
        ({ chart } = useStackedLineChart(params));
    } else if (chartType === CHART_TYPE.DONUT) {
        ({ chart } = usePieChart(params));
    } else {
        throw new Error(`useDynamicChart: ${chartType} is not available chart type. ${Object.values(CHART_TYPE)} are available.`);
    }
    return {
        chart,
    };
};
