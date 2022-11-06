<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.BUDGET_STATUS')"
                                       :data-range="200"
                                       class="budget-status"
                                       :widget-link="widgetLink"
                                       :print-mode="printMode"
                                       :class="{ 'print-mode': printMode }"
    >
        <p-data-loader :loading="loading"
                       class="chart-wrapper"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div class="waffle-chart">
                <div v-for="colIdx in colRange"
                     :key="`status-col-${colIdx}`"
                     class="status-col-wrapper"
                >
                    <template v-for="rowIdx in rowRange">
                        <router-link v-if="!!chartData[colIdx * 10 + rowIdx]"
                                     :key="`status-box-${colIdx}-${rowIdx}`"
                                     v-tooltip.bottom="getTooltipText(rowIdx, colIdx)"
                                     :to="chartData[colIdx * 10 + rowIdx].linkLocation"
                                     class="box status-box"
                                     :style="{ 'background-color': chartData[colIdx * 10 + rowIdx].color }"
                        />
                        <div v-else
                             :key="`status-box-${colIdx}-${rowIdx}`"
                             class="box"
                        />
                    </template>
                </div>
            </div>
        </p-data-loader>
        <div class="legend-wrapper">
            <div v-for="legend in legends"
                 :key="`legend-${legend.label}`"
                 class="legend"
            >
                <span class="legend-icon"
                      :style="{ 'background-color': legend.color }"
                />
                {{ legend.label }}
            </div>
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">

import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Location } from 'vue-router';
import type { Vue } from 'vue/types/vue';

import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo, yellow, red } from '@/styles/colors';

import {
    getConvertedBudgetFilter,
} from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

interface ChartData {
    budgetId: string;
    budgetName: string;
    color: string;
    usage: number;
    limit: number;
    usdCost: number;
    linkLocation: Location;
}

export default defineComponent<WidgetProps>({
    name: 'BudgetStatus',
    components: {
        CostDashboardCardWidgetLayout,
        PDataLoader,
        PSkeleton,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        widgetId: {
            type: String,
            default: '',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: WidgetProps, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const budgetQueryHelper = new QueryHelper();
        const state = reactive({
            loading: false,
            chartData: [] as ChartData[],
            colRange: range(0, 20),
            rowRange: range(0, 10),
            legends: computed(() => ([
                { label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.OVERSPENT'), color: red[400] },
                { label: '90-100%', color: yellow[500] },
                { label: '70-90%', color: indigo[500] },
                { label: '< 70%', color: indigo[100] },
            ])),
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.BUDGET._NAME,
                    params: {},
                    query: {
                        filters: budgetQueryHelper.setFilters(getConvertedBudgetFilter(props.filters)).rawQueryStrings,
                    },
                };
            }),
        });

        /* util */
        const getConvertedChartData = (rawData): ChartData[] => {
            const chartData: ChartData[] = [];
            rawData.forEach((d) => {
                let color;
                let usage = d.usage;
                if (usage === undefined || usage < 0) usage = 0;

                if (d.limit !== 0) {
                    if (usage < 70) color = indigo[100];
                    else if (usage < 90) color = indigo[500];
                    else if (usage < 100) color = yellow[500];
                    else color = red[400];
                } else if (d.usd_cost > 0) color = red[400];
                else color = indigo[100];

                chartData.push({
                    budgetId: d.budget_id,
                    budgetName: d.name,
                    color,
                    usage,
                    limit: d.limit,
                    usdCost: d.usd_cost,
                    linkLocation: {
                        name: COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
                        params: {
                            budgetId: d.budget_id,
                        },
                    },
                });
            });
            return chartData;
        };
        const getTooltipText = (rowIdx, colIdx) => {
            const index = colIdx * 10 + rowIdx;
            const limit = state.chartData[index].limit;
            const usdCost = state.chartData[index].usdCost;
            const usage = state.chartData[index].usage;

            let percentage;
            if (usdCost === 0) percentage = '0%';
            else if (limit === 0) percentage = '-';
            else percentage = `${usage.toFixed(2)}%`;
            return `${state.chartData[index].budgetName} (${percentage})`;
        };

        /* api */
        const getBudgetUsageData = async (period, filters) => {
            budgetQueryHelper.setFilters(getConvertedBudgetFilter(filters));
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze({
                    include_budget_count: false,
                    include_project_info: false,
                    include_budget_info: true,
                    group_by: ['budget_id'],
                    start: dayjs.utc(period.start).format('YYYY-MM'),
                    end: dayjs.utc(period.end).format('YYYY-MM'),
                    sort: {
                        key: 'usage',
                        desc: true,
                    },
                    page: {
                        limit: 200,
                    },
                    ...budgetQueryHelper.apiQuery,
                });
                state.chartData = getConvertedChartData(results);
            } catch (e) {
                state.chartData = [];
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        watch([() => props.period, () => props.filters], async ([period, filters]) => {
            await getBudgetUsageData(period, filters);
            await vm.$nextTick();
            emit('rendered');
        }, { immediate: true });

        return {
            ...toRefs(state),
            COST_EXPLORER_ROUTE,
            getTooltipText,
        };
    },
});
</script>

<style lang="postcss" scoped>
.budget-status {
    .chart-wrapper {
        height: 25rem;
    }
    .waffle-chart {
        display: flex;
        height: 100%;
        gap: 0.25rem;
        .status-col-wrapper {
            display: grid;
            width: 5%;
            height: 100%;
            gap: 0.25rem;
            .box {
                @apply bg-gray-100;
                width: 100%;
                &.status-box {
                    cursor: pointer;
                }
            }
        }
    }
    .legend-wrapper {
        @apply text-gray-600;
        display: flex;
        gap: 0.75rem;
        font-size: 0.75rem;
        padding-top: 1rem;
        .legend {
            .legend-icon {
                display: inline-block;
                width: 0.875rem;
                height: 0.625rem;
            }
        }
    }
}
.print-mode {
    .legend {
        white-space: nowrap;
    }
}
</style>
