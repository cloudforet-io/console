<template>
    <div class="cost-analysis-chart" :class="{'print-mode': printMode}">
        <section ref="chartRef" class="chart-section">
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
        <section ref="queryRef" class="query-section">
            <!--filter-->
            <div class="title-wrapper">
                <span class="title">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER') }}</span>
                <div v-if="!printMode" class="button-wrapper">
                    <p-button style-type="gray-border"
                              font-weight="normal" size="sm"
                              :disabled="!filtersLength"
                              @click="handleClearAllFilters"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CLEAR_ALL') }}
                    </p-button>
                    <p-icon-button
                        name="ic_plus"
                        style-type="gray900"
                        size="sm"
                        @click="handleClickSelectFilter"
                    />
                </div>
            </div>
            <div class="filter-wrapper">
                <template v-if="noFilter">
                    <p-empty>
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_FILTERS') }}
                    </p-empty>
                </template>
                <template v-else>
                    <template v-for="(selectedItems, filterName, idx) in filterItemsMap">
                        <p-tag v-for="(item, itemIdx) in selectedItems" :key="`selected-tag-${idx}-${item.name}`"
                               :deletable="!printMode"
                               @delete="handleDeleteFilterTag(filterName, itemIdx)"
                        >
                            <b>{{ FILTER_ITEM_MAP[filterName].label }}: </b>{{ item.label }}
                        </p-tag>
                    </template>
                </template>
            </div>

            <!--legend-->
            <div class="title-wrapper">
                <p-select-dropdown v-if="groupByItems.length"
                                   :items="groupByItems"
                                   :selected="primaryGroupBy"
                                   style-type="transparent"
                                   :read-only="printMode"
                                   @select="handlePrimaryGroupByItem"
                />
                <span v-else class="title">Total Cost</span>
                <div v-if="!printMode" class="button-wrapper">
                    <p-button style-type="gray-border"
                              size="sm" font-weight="normal"
                              @click="handleToggleAllLegends"
                    >
                        {{ showHideAll ? $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HIDE_ALL') : $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SHOW_ALL') }}
                    </p-button>
                </div>
            </div>
            <p-data-loader :loading="loading" :data="legends" class="legend-wrapper">
                <p v-if="legends.length > 15" class="too-many-text">
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOO_MANY_ITEMS') }}
                </p>
                <div v-for="(legend, idx) in legends" :key="`legend-${legend.name}`"
                     class="legend"
                     @click="handleClickLegend(idx)"
                >
                    <p-status :text="legend.label"
                              :icon-color="getLegendIconColor(idx)"
                              :text-color="getLegendTextColor(idx)"
                    />
                </div>
                <template #no-data>
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_ITEMS') }}
                </template>
            </p-data-loader>
        </section>
        <set-filter-modal v-if="!printMode"
                          :visible.sync="filterModalVisible"
                          :selected-filters="filters"
                          :filter-items="filterItems"
                          @confirm="handleConfirmFilterModal"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PieChart, XYChart } from '@amcharts/amcharts4/charts';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PButton, PIconButton, PSelectDropdown, PStatus, PTag, PDataLoader, PEmpty,
} from '@spaceone/design-system';
import axios, { CancelTokenSource } from 'axios';
import dayjs from 'dayjs';
import {
    cloneDeep, debounce, sum, isEmpty,
} from 'lodash';


import { store } from '@/store';


import { hideAllSeries, showAllSeries, toggleSeries } from '@/lib/amcharts/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import {
    getConvertedFilter,
} from '@/services/cost-explorer/cost-analysis/lib/helper';
import CostAnalysisPieChart
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPieChart.vue';
import CostAnalysisStackedColumnChart
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisStackedColumnChart.vue';
import {
    FILTER_ITEM_MAP, GRANULARITY,
} from '@/services/cost-explorer/lib/config';
import { costExplorerStore } from '@/services/cost-explorer/store';
import { Period, Granularity, GroupBy } from '@/services/cost-explorer/type';
import {
    getLegends,
    getPieChartData,
    getXYChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import {
    Legend, PieChartData, XYChartData,
} from '@/services/cost-explorer/widgets/type';


const SetFilterModal = () => import('@/services/cost-explorer/modules/SetFilterModal.vue');


export default {
    name: 'CostAnalysisChart',
    components: {
        CostAnalysisStackedColumnChart,
        CostAnalysisPieChart,
        SetFilterModal,
        PButton,
        PIconButton,
        PSelectDropdown,
        PStatus,
        PTag,
        PDataLoader,
        PEmpty,
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
            noFilter: computed(() => isEmpty(state.filterItemsMap) || Object.values(state.filters).every(d => !d)),
            groupByItems: computed(() => costExplorerStore.getters['costAnalysis/groupByItems']),
            filterItemsMap: computed(() => costExplorerStore.getters['costAnalysis/filterItemsMap']),
            filterItems: computed(() => Object.values(FILTER_ITEM_MAP).map(item => ({
                name: item.name, title: item.label,
            }))),
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            filtersLength: computed<number>(() => {
                const selectedValues: Array<string[]> = Object.values(state.filters);
                return sum(selectedValues.map(v => v?.length || 0));
            }),
            //
            loading: true,
            legends: [] as Legend[],
            showHideAll: computed(() => state.legends.some(legend => !legend.disabled)),
            chartData: [] as Array<XYChartData|PieChartData>,
            chart: null as XYChart | PieChart | null,
            filterModalVisible: false,
            queryRef: null as null|HTMLElement,
            chartRef: null as null|HTMLElement,
        });

        /* util */
        const getLegendIconColor = (index) => {
            const legend = state.legends[index];
            if (legend?.disabled) return DISABLED_LEGEND_COLOR;
            if (legend?.color) return legend.color;
            return DEFAULT_CHART_COLORS[index];
        };
        const getLegendTextColor = (index) => {
            const legend = state.legends[index];
            if (legend?.disabled) return DISABLED_LEGEND_COLOR;
            return null;
        };

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
        const setChartData = debounce(async (granularity: Granularity, period: Period, groupBy?: GroupBy) => {
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
        const handleClickLegend = (index) => {
            toggleSeries(state.chart as XYChart | PieChart, index);
            state.legends[index].disabled = !state.legends[index]?.disabled;
        };
        const handleToggleAllLegends = () => {
            if (state.showHideAll) {
                hideAllSeries(state.chart as XYChart | PieChart);
                state.legends.forEach((d) => {
                    d.disabled = true;
                });
            } else {
                showAllSeries(state.chart as XYChart | PieChart);
                state.legends.forEach((d) => {
                    d.disabled = false;
                });
            }
        };
        const handlePrimaryGroupByItem = async (groupBy?: string) => {
            costExplorerStore.commit('costAnalysis/setPrimaryGroupBy', groupBy);
        };
        const handleClickSelectFilter = () => {
            state.filterModalVisible = true;
        };
        const handleClearAllFilters = () => {
            costExplorerStore.commit('costAnalysis/setFilters', {});
        };
        const handleDeleteFilterTag = (filterName: string, itemIdx: number) => {
            const _filters = cloneDeep(state.filters);
            const _selectedItems = [..._filters[filterName]];
            _selectedItems.splice(itemIdx, 1);
            if (_selectedItems.length) {
                _filters[filterName] = _selectedItems;
            } else {
                _filters[filterName] = undefined;
            }
            costExplorerStore.commit('costAnalysis/setFilters', _filters);
        };
        const handleConfirmFilterModal = (filters) => {
            costExplorerStore.commit('costAnalysis/setFilters', filters);
        };

        const handleChartRendered = () => {
            if (state.chartRef && state.queryRef) emit('rendered', [state.queryRef, state.chartRef]);
        };

        watch(() => state.groupByItems, (after, before) => {
            if (!after.length) {
                costExplorerStore.commit('costAnalysis/setPrimaryGroupBy', undefined);
            } else if ((!before.length && after.length) || !after.filter(d => d.name === state.primaryGroupBy).length) {
                costExplorerStore.commit('costAnalysis/setPrimaryGroupBy', after[0].name);
            }
        });
        watch([() => state.granularity, () => state.period, () => state.primaryGroupBy, () => state.filters], ([granularity, period, groupBy]) => {
            setChartData(granularity, period, groupBy);
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            FILTER_ITEM_MAP,
            DISABLED_LEGEND_COLOR,
            DEFAULT_CHART_COLORS,
            GRANULARITY,
            getLegendIconColor,
            getLegendTextColor,
            handleClickLegend,
            handleToggleAllLegends,
            handlePrimaryGroupByItem,
            handleClickSelectFilter,
            handleDeleteFilterTag,
            handleClearAllFilters,
            handleConfirmFilterModal,
            handleChartRendered,
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
    .query-section {
        @apply col-span-3 bg-white rounded-md border border-gray-200;
        .title-wrapper {
            @apply border-b border-gray-200;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 2.5rem;
            padding: 0.5rem 1rem;
            .title {
                font-size: 0.875rem;
                font-weight: bold;
            }
            .p-select-dropdown::v-deep {
                .dropdown-button {
                    font-weight: bold;
                }
            }
            .button-wrapper {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
        }

        .filter-wrapper {
            height: 8rem;
            overflow-y: auto;
            padding: 0.75rem 1rem;
            .p-tag {
                margin-bottom: 0.5rem;
            }
        }
        .legend-wrapper {
            height: 16.75rem;
            overflow-y: auto;
            padding: 0.5rem 0;

            .too-many-text {
                @apply text-gray-400;
                font-size: 0.75rem;
                padding: 0 1rem 0.5rem 1rem;
            }
            .legend {
                height: 25px;
                display: flex;
                align-items: center;
                font-size: 0.875rem;
                cursor: pointer;
                padding: 0 1rem;

                &:hover {
                    @apply bg-gray-100;
                }
                &.disabled {
                    @apply text-gray-300;
                }
                .p-status::v-deep {
                    .text {
                        white-space: nowrap;
                    }
                }
            }
        }
    }

    @define-mixin row-stack {
        height: auto;
        .chart-section {
            @apply col-span-12;
        }
        .query-section {
            @apply col-span-12 row-start-1;
            .legend-wrapper {
                height: auto;
                padding: 0.5rem;
                .legend {
                    display: inline-block;
                    .p-status {
                        height: 100%;
                    }
                }
            }
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
