<template>
    <div class="cost-analysis-chart">
        <section class="chart-section">
            <cost-analysis-dynamic-widget :chart.sync="chart"
                                          :chart-type="selectedChartType"
                                          :chart-data="chartData"
                                          :granularity="selectedGranularity"
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
                <p-select-dropdown v-if="selectedGroupByItems.length"
                                   :items="selectedGroupByItems"
                                   :selected="selectedGroupBy"
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

import { store } from '@/store';
import { gray } from '@/styles/colors';
import { CUSTOM_COLORS, hideAllSeries, toggleSeries } from '@/common/composables/dynamic-chart';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';
import { ChartType, Granularity, GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { ChartData, Legend } from '@/common/composables/dynamic-chart/type';

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
            selectedGranularity: computed<Granularity>(() => store.state.service.costAnalysis.granularity),
            selectedGroupByItems: computed<Array<GroupByItem>>(() => store.state.service.costAnalysis.groupByItems),
            selectedGroupBy: computed<string>(() => store.state.service.costAnalysis.groupBy),
            selectedChartType: computed<ChartType>(() => store.state.service.costAnalysis.chartType),
            legends: computed<Legend>(() => store.state.service.costAnalysis.legends),
            chartData: computed<ChartData>(() => store.state.service.costAnalysis.chartData),
            period: computed(() => {
                const selectedDates = store.state.service.costAnalysis.selectedDates;
                return {
                    start: dayjs(selectedDates[0]),
                    end: dayjs(selectedDates[1]),
                };
            }),
            //
            chart: null as XYChart | PieChart | null,
            filters: [],
            colors: computed(() => state.chart?.colors),
        });

        const selectFilterModalState = reactive({
            visible: false,
        });

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
            await store.dispatch('service/costAnalysis/listChartData');
        };
        const handleClickSelectFilter = () => {
            selectFilterModalState.visible = true;
        };
        const handleSelectFilterModalConfirm = () => {
            console.log('Select Filter Modal Confirm');
        };

        watch(() => state.selectedGroupByItems, (after, before) => {
            if (!after.length) {
                handleSelectGroupByItem(undefined);
            } else if ((!before.length && after.length) || !after.filter(d => d.name === state.selectedGroupBy).length) {
                handleSelectGroupByItem(after[0].name);
            }
        });

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
