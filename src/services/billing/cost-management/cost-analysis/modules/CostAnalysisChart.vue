<template>
    <div class="cost-analysis-chart">
        <section class="chart-section">
            <cost-analysis-dynamic-widget :loading="loading"
                                          :chart.sync="chart"
                                          :stack="stack"
                                          :chart-data="chartData"
                                          :granularity="granularity"
                                          :legends="legends"
                                          :period="period"
                                          :currency="currency"
                                          :currency-rates="currencyRates"
            />
        </section>
        <section class="query-section">
            <!--filter-->
            <div class="title-wrapper">
                <span class="title">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER') }}</span>
                <div class="button-wrapper">
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
            <p-data-loader :loading="false" :data="filterItemsMap" class="filter-wrapper">
                <template v-for="(selectedItems, filterName, idx) in filterItemsMap">
                    <p-tag v-for="(item, itemIdx) in selectedItems" :key="`selected-tag-${idx}-${item.name}`"
                           @delete="handleDeleteFilterTag(filterName, itemIdx)"
                    >
                        <b>{{ FILTER_ITEM_MAP[filterName].label }}: </b>{{ item.label }}
                    </p-tag>
                </template>
                <template #no-data>
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_FILTERS') }}
                </template>
            </p-data-loader>

            <!--legend-->
            <div class="title-wrapper">
                <p-select-dropdown v-if="groupByItems.length"
                                   :items="groupByItems"
                                   :selected="chartGroupBy"
                                   without-outline
                                   @select="handleSelectChartGroupByItem"
                />
                <span v-else class="title">Total Cost</span>
                <div class="button-wrapper">
                    <p-button style-type="gray-border"
                              size="sm" font-weight="normal"
                              @click="handleClickHideAllLegends"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HIDE_ALL') }}
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
                              :icon-color="legend.disabled ? DISABLED_LEGEND_COLOR : DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]"
                              :text-color="legend.disabled ? DISABLED_LEGEND_COLOR : null"
                    />
                </div>
                <template #no-data>
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_ITEMS') }}
                </template>
            </p-data-loader>
        </section>
        <set-filter-modal :visible.sync="filterModalVisible"
                          :selected-filters="filters"
                          :filter-items="filterItems"
        />
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { cloneDeep, debounce, sum } from 'lodash';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';
import axios, { CancelTokenSource } from 'axios';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButton, PIconButton, PSelectDropdown, PStatus, PTag, PDataLoader,
} from '@spaceone/design-system';

import CostAnalysisDynamicWidget
    from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisDynamicWidget.vue';
import SetFilterModal
    from '@/services/billing/cost-management/modules/SetFilterModal.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { hideAllSeries, toggleSeries } from '@/lib/amcharts/helper';
import { getXYChartDataAndLegends } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import {
    getConvertedFilter,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import {
    Legend, PieChartRawData, PieChartData, XYChartData,
} from '@/services/billing/cost-management/widgets/type';
import {
    FILTER_ITEM_MAP, GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP,
} from '@/services/billing/cost-management/lib/config';
import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';
import { store } from '@/store';


export default {
    name: 'CostAnalysisChart',
    components: {
        CostAnalysisDynamicWidget,
        SetFilterModal,
        PButton,
        PIconButton,
        PSelectDropdown,
        PStatus,
        PTag,
        PDataLoader,
    },
    setup() {
        const state = reactive({
            granularity: computed(() => store.state.service.costAnalysis.granularity),
            stack: computed(() => store.state.service.costAnalysis.stack),
            period: computed(() => store.state.service.costAnalysis.period),
            filters: computed(() => store.state.service.costAnalysis.filters),
            chartGroupBy: store.state.service.costAnalysis.groupBy[0],
            //
            groupByItems: computed(() => store.getters['service/costAnalysis/groupByItems']),
            filterItemsMap: computed(() => store.getters['service/costAnalysis/filterItemsMap']),
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
            chartData: [] as Array<XYChartData|PieChartData>,
            chart: null as XYChart | PieChart | null,
            filterModalVisible: false,
        });

        /* util */
        const getLegendsFromGroupByNames = (groupByNames: string[], groupBy?: GROUP_BY): Legend[] => {
            let legends: Legend[] = [];
            if (groupBy) {
                const _providers = store.state.resource.provider.items;
                const _serviceAccounts = store.state.resource.serviceAccount.items;
                const _projects = store.state.resource.project.items;
                const _regions = store.state.resource.region.items;
                groupByNames.forEach((d) => {
                    let _label = d;
                    if (groupBy === GROUP_BY.PROJECT) {
                        _label = _projects[d]?.label || d;
                    } else if (groupBy === GROUP_BY.SERVICE_ACCOUNT) {
                        _label = _serviceAccounts[d]?.label || d;
                    } else if (groupBy === GROUP_BY.REGION) {
                        _label = _regions[d]?.name || d;
                    } else if (groupBy === GROUP_BY.PROVIDER) {
                        _label = _providers[d]?.name || d;
                    }
                    legends.push({
                        name: d as string,
                        label: _label as string,
                        disabled: false,
                    });
                });
            } else {
                legends = [{ name: 'totalCost', label: 'Total Cost', disabled: false }];
            }
            return legends;
        };
        const getPieChartDataAndLegends = (rawData: PieChartRawData[], groupBy?: GROUP_BY): { chartData: PieChartData[]; legends: Legend[] } => {
            let chartData: PieChartData[] = [];
            const groupByNameSet = new Set<string>();

            if (groupBy) {
                rawData.forEach((d) => {
                    let groupByName = d[groupBy];
                    if (!groupByName) groupByName = `No ${GROUP_BY_ITEM_MAP[groupBy].label}`;
                    chartData.push({
                        category: groupByName,
                        value: d.usd_cost,
                    });
                    groupByNameSet.add(groupByName);
                });
            } else if (rawData[0]?.usd_cost) {
                chartData = [{
                    category: 'Total Cost',
                    value: rawData[0].usd_cost,
                }];
            }

            const groupByNames = [...groupByNameSet];
            return {
                chartData,
                legends: getLegendsFromGroupByNames(groupByNames, groupBy),
            };
        };

        /* api */
        let listCostAnalysisRequest: CancelTokenSource | undefined;
        const costQueryHelper = new QueryHelper();
        const listCostAnalysisChartData = async () => {
            if (listCostAnalysisRequest) {
                listCostAnalysisRequest.cancel('Next request has been called.');
                listCostAnalysisRequest = undefined;
            }
            listCostAnalysisRequest = axios.CancelToken.source();
            try {
                costQueryHelper.setFilters(getConvertedFilter(state.filters));
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_etc: !!state.chartGroupBy,
                    granularity: state.granularity,
                    group_by: state.chartGroupBy ? [state.chartGroupBy] : [],
                    start: dayjs.utc(state.period.start).format('YYYY-MM-DD'),
                    end: dayjs.utc(state.period.end).add(1, 'day').format('YYYY-MM-DD'),
                    limit: 15,
                    pivot_type: 'CHART',
                    ...costQueryHelper.apiQuery,
                });
                listCostAnalysisRequest = undefined;
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return undefined;
            }
        };

        /* event */
        const handleClickLegend = (index) => {
            toggleSeries(state.chart as XYChart | PieChart, index);
            state.legends[index].disabled = !state.legends[index]?.disabled;
        };
        const handleClickHideAllLegends = () => {
            hideAllSeries(state.chart as XYChart | PieChart);
            state.legends.forEach((d) => {
                d.disabled = true;
            });
        };
        const handleSelectChartGroupByItem = async (groupBy?: string) => {
            state.chartGroupBy = groupBy;
        };
        const handleClickSelectFilter = () => {
            state.filterModalVisible = true;
        };
        const handleClearAllFilters = () => {
            store.commit('service/costAnalysis/setFilters', {});
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
            store.commit('service/costAnalysis/setFilters', _filters);
        };
        const refreshChart = debounce(async () => {
            state.loading = true;

            const rawData = await listCostAnalysisChartData();
            let chartData;
            let legends;
            if (state.granularity === GRANULARITY.ACCUMULATED) {
                ({ chartData, legends } = getPieChartDataAndLegends(rawData, state.chartGroupBy));
            } else {
                ({ chartData, legends } = getXYChartDataAndLegends(rawData, state.chartGroupBy));
            }
            state.chartData = chartData;
            state.legends = legends;
            state.loading = false;
        }, 300);

        watch(() => state.groupByItems, (after, before) => {
            if (!after.length) {
                state.chartGroupBy = undefined;
            } else if ((!before.length && after.length) || !after.filter(d => d.name === state.chartGroupBy).length) {
                state.chartGroupBy = after[0].name;
            }
        });
        watch([() => state.granularity, () => state.period, () => state.chartGroupBy, () => state.filters], () => {
            refreshChart();
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            FILTER_ITEM_MAP,
            DISABLED_LEGEND_COLOR,
            DEFAULT_CHART_COLORS,
            CHART_TYPE,
            GRANULARITY,
            handleClickLegend,
            handleClickHideAllLegends,
            handleSelectChartGroupByItem,
            handleClickSelectFilter,
            handleDeleteFilterTag,
            handleClearAllFilters,
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
            }
        }
    }

    @screen tablet {
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
}
</style>
