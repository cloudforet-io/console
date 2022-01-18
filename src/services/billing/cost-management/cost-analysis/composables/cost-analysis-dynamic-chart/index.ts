import { PieChart, XYChart } from '@amcharts/amcharts4/charts';

import {
    reactive,
} from '@vue/composition-api';

import drawStackedColumnChart from '@/services/billing/cost-management/cost-analysis/composables/cost-analysis-dynamic-chart/draw-stacked-column-chart';
import drawPieChart from '@/services/billing/cost-management/cost-analysis/composables/cost-analysis-dynamic-chart/draw-pie-chart';

import { DynamicChartStateArgs } from '@/services/billing/cost-management/cost-analysis/composables/cost-analysis-dynamic-chart/type';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';


/* hooks */
const useStackedColumnChart = ({
    data, valueOptions, categoryOptions, chartContainer,
}: DynamicChartStateArgs) => {
    const state = reactive({
        data, valueOptions, categoryOptions, chartContainer,
    });

    const chart = drawStackedColumnChart(state.data, state.chartContainer, state.valueOptions, state.categoryOptions);

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
    } else if (chartType === CHART_TYPE.DONUT) {
        ({ chart } = usePieChart(params));
    } else {
        throw new Error(`useDynamicChart: ${chartType} is not available chart type. ${Object.values(CHART_TYPE)} are available.`);
    }
    return {
        chart,
    };
};
