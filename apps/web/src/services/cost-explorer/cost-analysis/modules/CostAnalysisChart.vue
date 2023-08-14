<script lang="ts" setup>

import type { PieChart, XYChart } from '@amcharts/amcharts4/charts';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    debounce,
} from 'lodash';
import type { ComponentPublicInstance } from 'vue';
import {
    computed, reactive, ref, watch,
} from 'vue';
import { useStore } from 'vuex';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/lib/amcharts/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostAnalysisChartQuerySection
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisChartQuerySection.vue';
import CostAnalysisPieChart
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPieChart.vue';
import CostAnalysisStackedColumnChart
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisStackedColumnChart.vue';
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
import {
    getLegends, getPieChartData, getXYChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import type {
    Legend, PieChartData, XYChartData,
} from '@/services/cost-explorer/widgets/type';

interface Props {
    printMode: boolean;
}

withDefaults(defineProps<Props>(), {
    printMode: false,
});
const emit = defineEmits<{(e: 'rendered', value: Element[]): void}>();
const store = useStore();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    currency: computed(() => store.state.settings.currency),
    currencyRates: computed(() => store.state.settings.currencyRates),
    //
    loading: true,
    legends: [] as Legend[],
    chartData: [] as Array<XYChartData|PieChartData>,
    chart: null as XYChart | PieChart | null,
});
const queryRef = ref<null|ComponentPublicInstance>(null);
const chartRef = ref<null|HTMLElement>(null);

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
        const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
            include_others: !!costAnalysisPageState.primaryGroupBy,
            granularity: costAnalysisPageState.granularity,
            group_by: costAnalysisPageState.primaryGroupBy ? [costAnalysisPageState.primaryGroupBy] : [],
            start: dayjs.utc(costAnalysisPageState.period.start).format(dateFormat),
            end: dayjs.utc(costAnalysisPageState.period.end).format(dateFormat),
            limit: 15,
            ...costQueryHelper.apiQuery,
        }, { cancelToken: listCostAnalysisRequest.token });
        listCostAnalysisRequest = undefined;
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const setChartData = debounce(async (granularity: Granularity, period: Period, groupBy?: GroupBy | string) => {
    state.loading = true;

    const rawData = await listCostAnalysisData();
    state.legends = getLegends(rawData, granularity, groupBy);
    if (granularity === GRANULARITY.ACCUMULATED) {
        state.chartData = getPieChartData(rawData, groupBy);
    } else {
        state.chartData = getXYChartData(rawData, granularity, period, groupBy);
    }
    state.loading = false;
}, 300);

/* event */
const handleToggleSeries = (index) => {
    toggleSeries(state.chart as XYChart | PieChart, index);
};
const handleAllSeries = (type) => {
    if (type === 'show') {
        showAllSeries(state.chart as XYChart | PieChart);
    } else {
        hideAllSeries(state.chart as XYChart | PieChart);
    }
};
const handleChartRendered = () => {
    if (chartRef.value && queryRef.value) {
        const elements: Element[] = [
            queryRef.value,
            chartRef.value,
        ];
        emit('rendered', elements);
    }
};

watch([
    () => costAnalysisPageState.granularity,
    () => costAnalysisPageState.period,
    () => costAnalysisPageState.primaryGroupBy,
    () => costAnalysisPageState.filters,
], ([granularity, period, groupBy]) => {
    setChartData(granularity, period, groupBy);
}, { immediate: true, deep: true });

</script>

<template>
    <div class="cost-analysis-chart"
         :class="{'print-mode': printMode}"
    >
        <section ref="chartRef"
                 class="chart-section"
        >
            <cost-analysis-pie-chart v-if="costAnalysisPageState.granularity === GRANULARITY.ACCUMULATED"
                                     v-model:chart="state.chart"
                                     :loading="state.loading"
                                     :chart-data="state.chartData"
                                     :legends="state.legends"
                                     :currency="state.currency"
                                     :currency-rates="state.currencyRates"
                                     :print-mode="printMode"
                                     @rendered="handleChartRendered"
            />
            <cost-analysis-stacked-column-chart v-else
                                                v-model:chart="state.chart"
                                                :loading="state.loading"
                                                :chart-data="state.chartData"
                                                :legends="state.legends"
                                                :granularity="costAnalysisPageState.granularity"
                                                :stack="costAnalysisPageState.stack"
                                                :period="costAnalysisPageState.period"
                                                :currency="state.currency"
                                                :currency-rates="state.currencyRates"
                                                :print-mode="printMode"
                                                @rendered="handleChartRendered"
            />
        </section>
        <cost-analysis-chart-query-section ref="queryRef"
                                           v-model:legends="state.legends"
                                           :print-mode="printMode"
                                           :loading="state.loading"
                                           @toggle-series="handleToggleSeries"
                                           @show-all-series="handleAllSeries('show')"
                                           @hide-all-series="handleAllSeries('hide')"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-chart {
    @apply grid grid-cols-12;
    grid-gap: 1rem;
    height: 30rem;

    .chart-section {
        @apply col-span-9 bg-white rounded-md border border-gray-200;
        padding: 1rem 1rem 1.5rem;
        min-height: 480px;
    }

    @define-mixin row-stack {
        height: auto;
        .chart-section {
            @apply col-span-12;
        }
    }

    &.print-mode {
        @mixin row-stack;
        .filter-wrapper {
            height: auto;
            padding: 0.75rem 1rem;
            .p-tag {
                margin-bottom: 0.5rem;
            }
            .p-empty {
                @apply flex justify-start;
            }
        }
        .legend-wrapper {
            height: auto;
            overflow-y: visible;
        }
        .query-section {
            .title {
                white-space: nowrap;
            }
        }
    }
    &:not(.print-mode) {
        @screen tablet {
            @mixin row-stack;
        }
    }
}
</style>
