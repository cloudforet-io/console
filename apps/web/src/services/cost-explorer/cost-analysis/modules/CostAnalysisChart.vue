<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/common/composables/amcharts5/concepts-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    getLegends, getXYChartData,
} from '@/services/cost-explorer/cost-analysis/lib/widget-data-helper';
import CostAnalysisChartLegends
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisChartLegends.vue';
import CostAnalysisStackedColumnChart
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisStackedColumnChart.vue';
import type {
    Legend, XYChartData,
} from '@/services/cost-explorer/cost-analysis/type';
import {
    GRANULARITY,
} from '@/services/cost-explorer/lib/config';
import {
    getConvertedFilter,
} from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type {
    CostAnalyzeResponse,
} from '@/services/cost-explorer/type';


type CostAnalyzeRawData = {
    [groupBy: string]: string | any;
    cost_sum?: Array<{
        date: string;
        value: number
    }>;
    _total_cost_sum?: number;
};

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    currency: computed(() => store.state.settings.currency),
    currencyRates: computed(() => store.state.settings.currencyRates),
    //
    loading: true,
    legends: [] as Legend[],
    chartData: [] as XYChartData[],
    chart: null as XYChart | null,
});

/* api */
const fetchCostAnalyze = getCancellableFetcher<CostAnalyzeResponse<CostAnalyzeRawData>>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const listCostAnalysisData = async (): Promise<CostAnalyzeResponse<CostAnalyzeRawData>> => {
    try {
        analyzeApiQueryHelper.setFilters(getConvertedFilter(costAnalysisPageState.filters));
        const dateFormat = costAnalysisPageState.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';
        if (!costAnalysisPageState.period) throw new Error('period is not defined');
        const { status, response } = await fetchCostAnalyze({
            data_source_id: costAnalysisPageStore.selectedDataSourceId,
            query: {
                granularity: costAnalysisPageState.granularity,
                group_by: costAnalysisPageState.chartGroupBy ? [costAnalysisPageState.chartGroupBy] : [],
                start: dayjs.utc(costAnalysisPageState.period.start).format(dateFormat),
                end: dayjs.utc(costAnalysisPageState.period.end).format(dateFormat),
                fields: {
                    cost_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                field_group: ['date'],
                sort: [{ key: '_total_cost_sum', desc: true }],
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
        return { more: false, results: [] };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { more: false, results: [] };
    }
};
const setChartData = debounce(async () => {
    state.loading = true;

    const rawData = await listCostAnalysisData();
    const { period, granularity, chartGroupBy } = costAnalysisPageState;
    state.legends = getLegends<CostAnalyzeRawData>(rawData, granularity, chartGroupBy);
    state.chartData = period ? getXYChartData<CostAnalyzeRawData>(rawData, granularity, period, chartGroupBy) : [];
    state.loading = false;
}, 300);

/* event */
const handleToggleSeries = (index) => {
    toggleSeries(state.chart as XYChart, index);
};
const handleAllSeries = (type) => {
    if (type === 'show') {
        showAllSeries(state.chart as XYChart);
    } else {
        hideAllSeries(state.chart as XYChart);
    }
};

watch([
    () => costAnalysisPageState,
    () => costAnalysisPageStore.selectedDataSourceId,
    () => costAnalysisPageStore.selectedQueryId,
], () => {
    setChartData();
}, { immediate: true, deep: true });
</script>

<template>
    <div class="cost-analysis-chart">
        <cost-analysis-stacked-column-chart :loading="state.loading"
                                            :chart.sync="state.chart"
                                            :chart-data="state.chartData"
                                            :legends="state.legends"
                                            :granularity="costAnalysisPageState.granularity"
                                            :period="costAnalysisPageState.period"
                                            :currency="state.currency"
                                            :currency-rates="state.currencyRates"
                                            class="cost-analysis-stacked-column-chart"
        />
        <cost-analysis-chart-legends :loading="state.loading"
                                     :legends.sync="state.legends"
                                     class="cost-analysis-chart-legends"
                                     @toggle-series="handleToggleSeries"
                                     @show-all-series="handleAllSeries('show')"
                                     @hide-all-series="handleAllSeries('hide')"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-chart {
    @apply grid grid-cols-12 border border-gray-200 rounded-md;
    grid-gap: 1rem;
    height: 26rem;
    padding: 1rem;
    margin-bottom: 1rem;

    .cost-analysis-stacked-column-chart {
        @apply col-span-9;
    }
    .cost-analysis-chart-legends {
        @apply col-span-3;
    }
}
</style>
