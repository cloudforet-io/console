<template>
    <div class="cost-analysis-chart"
         :class="{'print-mode': printMode}"
    >
        <section ref="chartRef"
                 class="chart-section"
        >
            <cost-analysis-pie-chart v-if="granularity === GRANULARITY.ACCUMULATED"
                                     :loading="loading"
                                     :chart.sync="chart"
                                     :chart-data="chartData"
                                     :legends="legends"
                                     :currency="currency"
                                     :currency-rates="currencyRates"
                                     :print-mode="printMode"
                                     @rendered="handleChartRendered"
            />
            <cost-analysis-stacked-column-chart v-else
                                                :loading="loading"
                                                :chart.sync="chart"
                                                :chart-data="chartData"
                                                :legends="legends"
                                                :granularity="granularity"
                                                :stack="stack"
                                                :period="period"
                                                :currency="currency"
                                                :currency-rates="currencyRates"
                                                :print-mode="printMode"
                                                @rendered="handleChartRendered"
            />
        </section>
        <cost-analysis-chart-query-section ref="queryRef"
                                           :print-mode="printMode"
                                           :loading="loading"
                                           :legends.sync="legends"
                                           @toggle-series="handleToggleSeries"
                                           @show-all-series="handleAllSeries('show')"
                                           @hide-all-series="handleAllSeries('hide')"
        />
    </div>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import type { PieChart, XYChart } from '@amcharts/amcharts4/charts';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    debounce,
} from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

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
import { costExplorerStore } from '@/services/cost-explorer/store';
import type {
    Period, Granularity, GroupBy,
} from '@/services/cost-explorer/type';
import {
    getLegends, getPieChartData, getXYChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import type {
    Legend, PieChartData, XYChartData,
} from '@/services/cost-explorer/widgets/type';

export default {
    name: 'CostAnalysisChart',
    components: {
        CostAnalysisChartQuerySection,
        CostAnalysisStackedColumnChart,
        CostAnalysisPieChart,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            granularity: computed(() => costExplorerStore.state.costAnalysis.granularity),
            stack: computed(() => costExplorerStore.state.costAnalysis.stack),
            period: computed(() => costExplorerStore.state.costAnalysis.period),
            filters: computed(() => costExplorerStore.state.costAnalysis.filters),
            selectedQueryId: computed(() => costExplorerStore.state.costAnalysis.selectedQueryId),
            groupBy: computed(() => costExplorerStore.state.costAnalysis.groupBy),
            primaryGroupBy: computed(() => costExplorerStore.state.costAnalysis.primaryGroupBy),
            //
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            //
            loading: true,
            legends: [] as Legend[],
            chartData: [] as Array<XYChartData|PieChartData>,
            chart: null as XYChart | PieChart | null,
            queryRef: null as null|HTMLElement,
            chartRef: null as null|HTMLElement,
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
                costQueryHelper.setFilters(getConvertedFilter(state.filters));
                const dateFormat = state.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_others: !!state.primaryGroupBy,
                    granularity: state.granularity,
                    group_by: state.primaryGroupBy ? [state.primaryGroupBy] : [],
                    start: dayjs.utc(state.period.start).format(dateFormat),
                    end: dayjs.utc(state.period.end).format(dateFormat),
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });
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
            if (state.chartRef && state.queryRef) emit('rendered', [state.queryRef, state.chartRef]);
        };

        watch([() => state.granularity, () => state.period, () => state.primaryGroupBy, () => state.filters], ([granularity, period, groupBy]) => {
            setChartData(granularity, period, groupBy);
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            GRANULARITY,
            handleChartRendered,
            handleToggleSeries,
            handleAllSeries,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-chart {
    @apply grid grid-cols-12;
    grid-gap: 1rem;
    height: 30rem;

    .chart-section {
        @apply col-span-9 bg-white rounded-md border border-gray-200;
        padding: 1rem 1rem 1.5rem 1rem;
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
