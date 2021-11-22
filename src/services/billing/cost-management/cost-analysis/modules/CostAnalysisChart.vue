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
            <p-data-loader :loading="false" :data="filters" class="filter-wrapper">
                <template v-for="([filterName, selectedItems], idx) in Object.entries(filters)">
                    <p-tag v-for="(item, itemIdx) in selectedItems" :key="`selected-tag-${idx}-${item.name}`"
                           @delete="handleDeleteFilterTag(filterName, itemIdx)"
                    >
                        <b>{{ Object.values(FILTER_MAP).find(d => d.name === filterName).label }}: </b>{{ item.label }}
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
                                   :selected="groupBy"
                                   without-outline
                                   @select="handleSelectGroupByItem"
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
                              :icon-color="legend.disabled ? DISABLED_COLOR : CUSTOM_COLORS[idx % CUSTOM_COLORS.length]"
                              :text-color="legend.disabled ? DISABLED_COLOR : null"
                    />
                </div>
                <template #no-data>
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_ITEMS') }}
                </template>
            </p-data-loader>
        </section>
        <cost-analysis-select-filter-modal :visible.sync="selectFilterModalState.visible" />
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
    from '@/services/billing/cost-management/cost-analysis/components/CostAnalysisDynamicWidget.vue';
import CostAnalysisSelectFilterModal
    from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSelectFilterModal.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { CUSTOM_COLORS, hideAllSeries, toggleSeries } from '@/common/composables/dynamic-chart';
import { ChartData, Legend } from '@/common/composables/dynamic-chart/type';
import {
    getConvertedFilter, getConvertedGranularity, getConvertedPeriod,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import {
    CHART_TYPE, FILTER_MAP, GRANULARITY, GROUP_BY_ITEM,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { gray } from '@/styles/colors';
import { store } from '@/store';
import { i18n } from '@/translations';


interface Value {
    usd_cost: number;
    [key: string]: any;
}
interface XYChartRawData {
    date: string;
    values: Value[];
}
interface PieChartRawData {
    usd_cost: number;
    [key: string]: any;
}

const DISABLED_COLOR = gray[300];

export default {
    name: 'CostAnalysisChart',
    components: {
        CostAnalysisDynamicWidget,
        CostAnalysisSelectFilterModal,
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
            groupByItems: computed(() => store.state.service.costAnalysis.groupByItems),
            groupBy: computed(() => store.state.service.costAnalysis.groupBy),
            chartType: computed(() => store.state.service.costAnalysis.chartType),
            period: computed(() => store.state.service.costAnalysis.period),
            filters: computed(() => store.state.service.costAnalysis.filters),
            filtersLength: computed<number>(() => {
                const selectedValues = Object.values(state.filters);
                return sum(selectedValues.map(v => v?.length || 0));
            }),
            //
            loading: true,
            legends: [] as Legend[],
            chartData: [] as ChartData[],
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
        const getLegendsFromGroupByNames = (groupByNames: string[], groupBy?: GROUP_BY_ITEM): Legend[] => {
            let legends: Legend[] = [];
            if (groupBy) {
                const _providers = store.state.resource.provider.items;
                const _serviceAccounts = store.state.resource.serviceAccount.items;
                const _projects = store.state.resource.project.items;
                const _regions = store.state.resource.region.items;
                groupByNames.forEach((d) => {
                    let _label = d;
                    if (groupBy === GROUP_BY_ITEM.PROJECT) {
                        _label = _projects[d]?.label || d;
                    } else if (groupBy === GROUP_BY_ITEM.SERVICE_ACCOUNT) {
                        _label = _serviceAccounts[d]?.label || d;
                    } else if (groupBy === GROUP_BY_ITEM.REGION) {
                        _label = _regions[d]?.name || d;
                    } else if (groupBy === GROUP_BY_ITEM.PROVIDER) {
                        _label = _providers[d]?.label || d;
                    }
                    legends.push({
                        name: d as string,
                        label: _label as string,
                        disabled: false,
                    });
                });
            } else {
                legends = [{ name: 'total_cost', label: 'Total Cost', disabled: false }];
            }
            return legends;
        };
        const getXYChartDataAndLegends = (rawData: XYChartRawData[], groupBy?: GROUP_BY_ITEM): { chartData: ChartData[]; legends: Legend[] } => {
            const chartData: ChartData[] = [];
            const groupByNameSet = new Set<string>();

            rawData.forEach((d) => {
                const eachChartData: ChartData = { date: d.date };
                if (groupBy) {
                    d.values.forEach((value) => {
                        let groupByName = value[groupBy];
                        if (!groupByName) groupByName = `No ${groupBy}`;
                        eachChartData[groupByName] = value.usd_cost;
                        groupByNameSet.add(groupByName);
                    });
                } else {
                    d.values.forEach((value) => {
                        eachChartData.total_cost = value.usd_cost;
                    });
                }
                chartData.push(eachChartData);
            });

            const groupByNames = [...groupByNameSet];
            return {
                chartData,
                legends: getLegendsFromGroupByNames(groupByNames, groupBy),
            };
        };
        const getPieChartDataAndLegends = (rawData: PieChartRawData[], groupBy?: GROUP_BY_ITEM): { chartData: ChartData[]; legends: Legend[] } => {
            let chartData: ChartData[] = [];
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
            } else {
                chartData = [{
                    category: 'Total Cost',
                    value: rawData[0]?.usd_cost || 0,
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
            const _groupBy = state.groupBy ? [state.groupBy] : [];
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
        const handleSelectGroupByItem = async (groupBy?: string) => {
            store.commit('service/costAnalysis/setGroupBy', groupBy);
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
        const refreshChart = async () => {
            state.loading = true;

            const rawData = await listCostAnalysisChartData();
            let chartData;
            let legends;
            if (state.chartType !== CHART_TYPE.DONUT) {
                ({ chartData, legends } = getXYChartDataAndLegends(rawData, state.groupBy));
            } else {
                ({ chartData, legends } = getPieChartDataAndLegends(rawData, state.groupBy));
            }
            state.chartData = chartData;
            state.legends = legends;
            state.loading = false;
        };

        watch(() => state.groupByItems, (after, before) => {
            if (!after.length) {
                handleSelectGroupByItem(undefined);
            } else if ((!before.length && after.length) || !after.filter(d => d.name === state.groupBy).length) {
                handleSelectGroupByItem(after[0].name);
            }
        });
        watch([() => state.chartType, () => state.granularity, () => state.period, () => state.groupBy, () => state.filters], () => {
            refreshChart();
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            selectFilterModalState,
            FILTER_MAP,
            DISABLED_COLOR,
            CUSTOM_COLORS,
            CHART_TYPE,
            GRANULARITY,
            handleClickLegend,
            handleClickHideAllLegends,
            handleSelectGroupByItem,
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
}
</style>
