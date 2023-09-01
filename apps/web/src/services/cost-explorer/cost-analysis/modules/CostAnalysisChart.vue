<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { SerialChart } from '@amcharts/amcharts5';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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
    Period, Granularity, GroupBy,
} from '@/services/cost-explorer/type';


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    currency: computed(() => store.state.settings.currency),
    currencyRates: computed(() => store.state.settings.currencyRates),
    //
    loading: true,
    legends: [] as Legend[],
    chartData: [] as XYChartData[],
    chart: null as SerialChart | null,
});

/* api */
let listCostAnalysisRequest: CancelTokenSource | undefined;
const costQueryHelper = new QueryHelper();
const listCostAnalysisData = async () => {
    if (listCostAnalysisRequest) {
        listCostAnalysisRequest.cancel('Next request has been called.');
        listCostAnalysisRequest = undefined;
    }
    listCostAnalysisRequest = axios.CancelToken.source();
    try {
        costQueryHelper.setFilters(getConvertedFilter(costAnalysisPageState.filters));
        const dateFormat = costAnalysisPageState.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';
        // TODO: Change to clientV2 after the cost analysis API is updated.
        const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
            include_others: !!costAnalysisPageState.chartGroupBy,
            granularity: costAnalysisPageState.granularity,
            group_by: costAnalysisPageState.chartGroupBy ? [costAnalysisPageState.chartGroupBy] : [],
            start: dayjs.utc(costAnalysisPageState.period.start).format(dateFormat),
            end: dayjs.utc(costAnalysisPageState.period.end).format(dateFormat),
            limit: 15,
            ...costQueryHelper.apiQuery,
        }, { cancelToken: listCostAnalysisRequest.token });
        listCostAnalysisRequest = undefined;
        // TODO: Remove conversion process after the cost analysis API is updated.
        return results.map((d) => ({
            ...d,
            cost: d.usd_cost,
            total_cost: d.total_usd_cost,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const setChartData = debounce(async (granularity: Granularity, period: Period, groupBy?: GroupBy | string) => {
    state.loading = true;

    const rawData = await listCostAnalysisData();
    state.legends = getLegends(rawData, granularity, groupBy);
    state.chartData = getXYChartData(rawData, granularity, period, groupBy);
    state.loading = false;
}, 300);

/* event */
const handleToggleSeries = (index) => {
    toggleSeries(state.chart as SerialChart, index);
};
const handleAllSeries = (type) => {
    if (type === 'show') {
        showAllSeries(state.chart as SerialChart);
    } else {
        hideAllSeries(state.chart as SerialChart);
    }
};

watch([
    () => costAnalysisPageState.granularity,
    () => costAnalysisPageState.period,
    () => costAnalysisPageState.chartGroupBy,
    () => costAnalysisPageState.filters,
], ([granularity, period, groupBy]) => {
    setChartData(granularity, period, groupBy);
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
