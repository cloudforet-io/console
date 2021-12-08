<template>
    <div class="cost-analysis-chart">
        <section class="chart-section">
            <template v-if="chartType === CHART_TYPE.DONUT && granularity !== GRANULARITY.ACCUMULATED">
                <span>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD') }} {{ donutPeriodText }}</span>
            </template>
            <cost-analysis-dynamic-widget :loading="loading"
                                          :chart.sync="chart"
                                          :chart-type="chartType"
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
        <set-filter-modal :visible.sync="selectFilterModalState.visible"
                          :selected-filters="filters"
                          :filter-items="filterItems"
                          @confirm="handleConfirmSetFilter"
        />
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { cloneDeep, sum } from 'lodash';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';

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
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { hideAllSeries, toggleSeries } from '@/lib/amcharts/helper';
import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import {
    getConvertedFilter, getConvertedGranularity, getConvertedPeriod,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import {
    FILTER_ITEM_MAP, GRANULARITY, GROUP_BY,
} from '@/services/billing/cost-management/lib/config';
import { getXYChartDataAndLegends } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import {
    Legend, PieChartRawData, PieChartData, XYChartData,
} from '@/services/billing/cost-management/widgets/type';


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
            chartType: computed(() => store.state.service.costAnalysis.chartType),
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
            donutPeriodText: computed(() => {
                if (state.chartType !== CHART_TYPE.DONUT) return '';
                if (state.granularity === GRANULARITY.DAILY) {
                    return `${dayjs.utc(state.period.start).format('YYYY/MM/DD')} (${i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY')})`;
                } if (state.granularity === GRANULARITY.MONTHLY) {
                    return `${dayjs.utc(state.period.end).format('MMM YYYY')} (${i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY')})`;
                }
                return `${dayjs.utc(state.period.end).format('YYYY')} (${i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.YEARLY')})`;
            }),
            chart: null as XYChart | PieChart | null,
        });

        const selectFilterModalState = reactive({
            visible: false,
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
                    if (!groupByName) groupByName = `No ${groupBy}`;
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
        const costApiQueryHelper = new ApiQueryHelper();
        const listCostAnalysisChartData = async () => {
            costApiQueryHelper.setFilters(getConvertedFilter(state.filters));
            let _granularity: GRANULARITY;
            const _period = getConvertedPeriod(state.granularity, state.chartType, state.period);
            const _groupBy = state.chartGroupBy ? [state.chartGroupBy] : [];
            if (state.chartType === CHART_TYPE.DONUT) {
                _granularity = GRANULARITY.ACCUMULATED;
            } else {
                _granularity = getConvertedGranularity(state.period, state.granularity);
            }

            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: _granularity,
                    group_by: _groupBy,
                    start: _period.start,
                    end: _period.end,
                    pivot_type: 'CHART',
                    ...costApiQueryHelper.data,
                });
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
            selectFilterModalState.visible = true;
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
        const handleConfirmSetFilter = (filters) => {
            store.commit('service/costAnalysis/setFilters', filters);
        };
        const refreshChart = async () => {
            state.loading = true;

            const rawData = await listCostAnalysisChartData();
            let chartData;
            let legends;
            if (state.chartType !== CHART_TYPE.DONUT) {
                ({ chartData, legends } = getXYChartDataAndLegends(rawData, state.chartGroupBy));
            } else {
                ({ chartData, legends } = getPieChartDataAndLegends(rawData, state.chartGroupBy));
            }
            state.chartData = chartData;
            state.legends = legends;
            state.loading = false;
        };

        watch(() => state.groupByItems, (after, before) => {
            if (!after.length) {
                state.chartGroupBy = undefined;
            } else if ((!before.length && after.length) || !after.filter(d => d.name === state.chartGroupBy).length) {
                state.chartGroupBy = after[0].name;
            }
        });
        watch([() => state.chartType, () => state.granularity, () => state.period, () => state.chartGroupBy, () => state.filters], () => {
            refreshChart();
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            selectFilterModalState,
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
            handleConfirmSetFilter,
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
