<template>
    <cost-dashboard-card-widget-layout title="Budget Status"
                                       :data-range="200"
                                       class="budget-status"
                                       :widget-link="widgetLink"
    >
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div class="waffle-chart">
                <div v-for="colIdx in colRange" :key="`status-col-${colIdx}`" class="status-col-wrapper">
                    <template v-for="rowIdx in rowRange">
                        <router-link v-if="!!chartData[colIdx * 10 + rowIdx]"
                                     :key="`status-box-${colIdx}-${rowIdx}`"
                                     v-tooltip.bottom="chartData[colIdx * 10 + rowIdx].budgetName"
                                     :to="chartData[colIdx * 10 + rowIdx].linkLocation"
                                     class="box status-box"
                                     :style="{ 'background-color': chartData[colIdx * 10 + rowIdx].color }"
                        />
                        <div v-else :key="`status-box-${colIdx}-${rowIdx}`" class="box" />
                    </template>
                </div>
            </div>
        </p-chart-loader>
        <div class="legend-wrapper">
            <div v-for="legend in legends" :key="`legend-${legend.label}`" class="legend">
                <span class="legend-icon" :style="{ 'background-color': legend.color }" />
                {{ legend.label }}
            </div>
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import { range } from 'lodash';
import dayjs from 'dayjs';
import { Location } from 'vue-router';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    getConvertedBudgetFilter,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { indigo, yellow, red } from '@/styles/colors';
import { i18n } from '@/translations';

interface ChartData {
    budgetId: string;
    budgetName: string;
    color: string;
    linkLocation: Location;
}

export default {
    name: 'BudgetStatus',
    components: {
        CostDashboardCardWidgetLayout,
        PChartLoader,
        PSkeleton,
    },
    props: {
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: WidgetProps) {
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
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                params: {},
                query: {
                    filters: budgetQueryHelper.setFilters(getConvertedBudgetFilter(props.filters)).rawQueryStrings,
                },
            })),
        });

        /* util */
        const getConvertedChartData = (rawData): ChartData[] => {
            const chartData: ChartData[] = [];
            rawData.forEach((d) => {
                let color = indigo[100];
                if (d.usage >= 70) color = indigo[500];
                if (d.usage >= 90) color = yellow[500];
                if (d.usage >= 70) color = red[400];
                chartData.push({
                    budgetId: d.budget_id,
                    budgetName: d.name,
                    color,
                    linkLocation: {
                        name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                        params: {
                            budgetId: d.budget_id,
                        },
                    },
                });
            });
            return chartData;
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

        watch([() => props.period, () => props.filters], ([period, filters]) => {
            getBudgetUsageData(period, filters);
        }, { immediate: true });

        return {
            ...toRefs(state),
            BILLING_ROUTE,
            range,
        };
    },
};
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
</style>
