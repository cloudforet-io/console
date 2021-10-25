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
                    <p-icon-button name="ic_plus" style-type="gray900" size="sm" />
                </div>
            </div>
            <div class="filter-wrapper" />

            <!--legend-->
            <div class="title-wrapper">
                <p-select-dropdown v-if="selectedGroupByItems.length"
                                   v-model="selectedGroupBy"
                                   :items="selectedGroupByItems"
                                   without-outline
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
                              :icon-color="legend.disabled ? DISABLED_COLOR : CUSTOM_COLORS[idx]"
                              :text-color="legend.disabled ? DISABLED_COLOR : null"
                    />
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { random } from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButton, PIconButton, PSelectDropdown, PStatus,
} from '@spaceone/design-system';

import CostAnalysisDynamicWidget
    from '@/services/billing/cost-management/cost-analysis/components/CostAnalysisDynamicWidget.vue';

import { store } from '@/store';
import { gray } from '@/styles/colors';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { CUSTOM_COLORS, hideAllSeries, toggleSeries } from '@/common/composables/dynamic-chart';
import { Legend } from '@/common/composables/dynamic-chart/type';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';
import dayjs from 'dayjs';


const DISABLED_COLOR = gray[300];

export default {
    name: 'CostAnalysisChart',
    components: {
        CostAnalysisDynamicWidget,
        PButton,
        PIconButton,
        PSelectDropdown,
        PStatus,
    },
    setup() {
        const state = reactive({
            selectedGranularity: computed(() => store.state.service.costAnalysis.selectedGranularity),
            selectedGroupByItems: computed(() => store.state.service.costAnalysis.selectedGroupByItems),
            selectedChartType: computed(() => store.state.service.costAnalysis.selectedChartType),
            chartData: computed(() => store.state.service.costAnalysis.chartData),
            period: computed(() => {
                const selectedDates = store.state.service.costAnalysis.selectedDates;
                return {
                    start: dayjs(selectedDates[0]),
                    end: dayjs(selectedDates[1]),
                };
            }),
            selectedGroupBy: undefined,
            //
            chart: null as XYChart | PieChart | null,
            filters: [],
            legends: [] as Legend[],
        });

        /* util */
        const setSampleLegends = () => {
            if (state.selectedGroupByItems.length) {
                state.legends = [
                    { name: 'seoul', label: 'Seoul', disabled: false },
                    { name: 'tokyo', label: 'Tokyo', disabled: false },
                    { name: 'virginia', label: 'Virginia', disabled: false },
                    { name: 'california', label: 'California', disabled: false },
                    { name: 'frankfurt', label: 'Frankfurt', disabled: false },
                    { name: 'stockholm', label: 'Stockholm', disabled: false },
                ];
            } else {
                state.legends = [{ name: 'total_cost', label: 'Total Cost', disabled: false }];
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

        watch(() => state.selectedGroupByItems, (after, before) => {
            if (!before.length && after.length) {
                state.selectedGroupBy = after[0].name;
            } else if (!after.length) {
                state.selectedGroupBy = undefined;
            } else if (!after.filter(d => d.name === state.selectedGroupBy).length) {
                state.selectedGroupBy = after[0].name;
            }
        });

        // todo get temp legends
        setSampleLegends();

        return {
            ...toRefs(state),
            DISABLED_COLOR,
            CUSTOM_COLORS,
            handleClickLegend,
            handleClickHideAllLegends,
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
