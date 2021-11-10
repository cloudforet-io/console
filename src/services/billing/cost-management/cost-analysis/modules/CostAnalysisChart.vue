<template>
    <div class="cost-analysis-chart">
        <section class="chart-section">
            <cost-analysis-dynamic-widget :chart.sync="chart"
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
                              :disabled="!filters.length"
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
            <div class="filter-wrapper" />

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
            <div class="legend-wrapper">
                <div v-for="(legend, idx) in legends" :key="`legend-${legend.name}`"
                     class="legend"
                     @click="handleClickLegend(idx)"
                >
                    <p-status :text="legend.label"
                              :icon-color="legend.disabled ? DISABLED_COLOR : CUSTOM_COLORS[idx % CUSTOM_COLORS.length]"
                              :text-color="legend.disabled ? DISABLED_COLOR : null"
                    />
                </div>
            </div>
        </section>
        <cost-analysis-select-filter-modal
            :visible.sync="selectFilterModalState.visible"
            @confirm="handleSelectFilterModalConfirm"
        />
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButton, PIconButton, PSelectDropdown, PStatus,
} from '@spaceone/design-system';

import CostAnalysisDynamicWidget
    from '@/services/billing/cost-management/cost-analysis/components/CostAnalysisDynamicWidget.vue';
import CostAnalysisSelectFilterModal
    from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSelectFilterModal.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { CUSTOM_COLORS, hideAllSeries, toggleSeries } from '@/common/composables/dynamic-chart';
import { ChartData, Legend } from '@/common/composables/dynamic-chart/type';
import { ChartType, Granularity, GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { getConvertedGranularity } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { gray } from '@/styles/colors';
import { store } from '@/store';


interface Value {
    usd_cost: number;
    [key: string]: any;
}
interface RawChartData {
    date: string;
    values: Array<Value>;
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
    },
    setup() {
        const state = reactive({
            granularity: computed<Granularity>(() => store.state.service.costAnalysis.granularity),
            groupByItems: computed<Array<GroupByItem>>(() => store.state.service.costAnalysis.groupByItems),
            groupBy: computed<string>(() => store.state.service.costAnalysis.groupBy),
            chartType: computed<ChartType>(() => store.state.service.costAnalysis.chartType),
            selectedDates: computed<Array<string>>(() => store.state.service.costAnalysis.selectedDates),
            filters: computed<Array<string>>(() => store.state.service.costAnalysis.filters),
            loading: true,
            legends: [] as Array<Legend>,
            chartData: [] as Array<ChartData>,
            period: computed(() => {
                const selectedDates = store.state.service.costAnalysis.selectedDates;
                return {
                    start: dayjs(selectedDates[0]),
                    end: dayjs(selectedDates[1]),
                };
            }),
            //
            chart: null as XYChart | PieChart | null,
        });

        const selectFilterModalState = reactive({
            visible: false,
        });

        /* util */
        const getChartDataFromRawData = (rawData: Array<RawChartData>, groupBy?: string): { chartData: Array<ChartData>; groupByValues: Set<string>} => {
            const chartData: Array<ChartData> = [];
            const groupByValues = new Set<string>();

            rawData.forEach((d) => {
                const dateData: ChartData = { date: d.date };
                if (groupBy) {
                    d.values.forEach((value) => {
                        dateData[value[groupBy]] = value.usd_cost;
                        if (value[groupBy]) groupByValues.add(value[groupBy]);
                    });
                } else {
                    d.values.forEach((value) => {
                        dateData.total_cost = value.usd_cost;
                    });
                }
                chartData.push(dateData);
            });

            return { chartData, groupByValues };
        };
        const getLegendsFromGroupByValues = (groupByValues: Set<string>, groupBy?: string): Array<Legend> => {
            let legends: Array<Legend>;
            if (groupBy) {
                // todo project_id, service account_id, region_code 일 경우 label formatting 해야 함
                legends = [...groupByValues].map(d => ({
                    name: d as string,
                    label: d as string,
                    disabled: false,
                }));
            } else {
                legends = [{ name: 'total_cost', label: 'Total Cost', disabled: false }];
            }
            return legends;
        };
        const convertChartDataAndLegends = (rawData: Array<RawChartData>, groupBy?: string): { chartData: Array<ChartData>; legends: Array<Legend> } => {
            const { chartData, groupByValues } = getChartDataFromRawData(rawData, groupBy);
            const legends = getLegendsFromGroupByValues(groupByValues, groupBy);

            return { chartData, legends };
        };

        /* api */
        const setChartDataAndLegends = async () => {
            state.loading = true;
            try {
                const granularity = getConvertedGranularity(state.selectedDates, state.granularity);
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity,
                    group_by: state.groupBy ? [state.groupBy] : [],
                    filter: [],
                    start: state.selectedDates[0],
                    end: dayjs(state.selectedDates[1]).add(1, 'day').format(),
                    pivot_type: 'CHART',
                });
                const { chartData, legends } = convertChartDataAndLegends(results, state.groupBy);
                state.chartData = chartData;
                state.legends = legends;
            } catch (e) {
                state.chartData = [];
                state.legends = [];
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
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
        const handleSelectFilterModalConfirm = () => {
            console.log('Select Filter Modal Confirm');
        };

        watch(() => state.groupByItems, (after, before) => {
            if (!after.length) {
                handleSelectGroupByItem(undefined);
            } else if ((!before.length && after.length) || !after.filter(d => d.name === state.groupBy).length) {
                handleSelectGroupByItem(after[0].name);
            }
        });
        watch([() => state.chartType, () => state.granularity, () => state.selectedDates, () => state.groupBy, () => state.filters], async () => {
            await setChartDataAndLegends();
        }, { immediate: true });

        return {
            ...toRefs(state),
            DISABLED_COLOR,
            CUSTOM_COLORS,
            handleClickLegend,
            handleClickHideAllLegends,
            handleSelectGroupByItem,
            handleClickSelectFilter,
            selectFilterModalState,
            handleSelectFilterModalConfirm,
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
        .chart {
            height: 100%;
        }
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
