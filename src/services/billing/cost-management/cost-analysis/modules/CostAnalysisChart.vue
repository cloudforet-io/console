<template>
    <div class="cost-analysis-chart">
        <section class="chart-section">
            <cost-analysis-dynamic-widget :chart-type="chartType"
                                          :chart-data="chartData"
                                          :legends="legends"
                                          :granularity="selectedGranularity"
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
                              @click="handleClickHideAll"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HIDE_ALL') }}
                    </p-button>
                </div>
            </div>
            <div class="legend-wrapper">
                <div class="legend" />
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { random } from 'lodash';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dayjs from 'dayjs';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButton, PIconButton, PSelectDropdown,
} from '@spaceone/design-system';

import CostAnalysisDynamicWidget from '@/services/billing/cost-management/cost-analysis/components/CostAnalysisDynamicWidget.vue';

import {
    CHART_TYPE,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { store } from '@/store';

dayjs.extend(isSameOrBefore);


export default {
    name: 'CostAnalysisChart',
    components: {
        CostAnalysisDynamicWidget,
        PButton,
        PIconButton,
        PSelectDropdown,
    },
    props: {
        chartType: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            selectedGranularity: computed(() => store.state.service.costAnalysis.selectedGranularity),
            selectedGroupByItems: computed(() => store.state.service.costAnalysis.selectedGroupByItems),
            selectedGroupBy: undefined,
            //
            filters: [],
            chartData: [] as any,
            chartRef: null as HTMLElement | null,
            chartRegistry: {},
            legends: computed(() => {
                if (state.selectedGroupByItems.length) {
                    return [
                        { name: 'seoul', label: 'Seoul' },
                        { name: 'tokyo', label: 'Tokyo' },
                        { name: 'virginia', label: 'Virginia' },
                        { name: 'california', label: 'California' },
                        { name: 'frankfurt', label: 'Frankfurt' },
                        { name: 'stockholm', label: 'Stockholm' },
                    ];
                }
                return [{ name: 'total_cost', label: 'Total Cost' }];
            }),
        });

        /* util */
        const getSampleChartData = () => {
            let now = dayjs.utc().startOf('month');
            const today = dayjs.utc(); // dayjs.utc().endOf('month');
            const chartData: any = [];

            while (now.isSameOrBefore(today, 'day')) {
                if (state.selectedGroupByItems.length) {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        seoul: random(10, 100),
                        tokyo: random(10, 100),
                        virginia: random(10, 100),
                        california: random(10, 100),
                        frankfurt: random(10, 100),
                        stockholm: random(10, 100),
                    });
                } else {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        total_cost: random(10, 100),
                    });
                }
                now = now.add(1, 'day');
            }
            state.chartData = chartData;
        };

        /* event */
        const handleClickHideAll = () => {
            console.log('hide all');
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

        watch(() => state.selectedGroupBy, () => {
            getSampleChartData();
        }, { immediate: false });

        watch([() => state.selectedGranularity, () => props.chartType], () => {
            getSampleChartData();
        }, { immediate: true });

        return {
            ...toRefs(state),
            CHART_TYPE,
            handleClickHideAll,
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
            .legend {
                height: 100%;
            }
        }
    }
}
</style>
