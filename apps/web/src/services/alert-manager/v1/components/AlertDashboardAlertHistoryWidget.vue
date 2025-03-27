<script setup lang="ts">
import {
    computed,
    reactive, watch, watchEffect,
} from 'vue';

import dayjs from 'dayjs';
import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PCard, PI, PDatePagination,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertDashboardAlertHistoryWidgetChart from '@/services/alert-manager/v1/components/AlertDashboardAlertHistoryWidgetChart.vue';

const ALERT_STATE = {
    CREATED: 'created',
    RESOLVED: 'resolved',
};

interface SummaryData {
    name: string;
    increase: number;
    dailyAverage?: number | string;
    monthlyTotal: number;
}

const props = defineProps<{
    activatedProjects: string[];
}>();

const userWorkspaceStore = useUserWorkspaceStore();
const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
});
const state = reactive({
    currentDate: dayjs.utc(),
    createdSummaryData: {
        name: ALERT_STATE.CREATED,
        increase: 0,
        dailyAverage: 0,
        monthlyTotal: 0,
    } as SummaryData,
    resolvedSummaryData: {
        name: ALERT_STATE.RESOLVED,
        increase: 0,
        dailyAverage: 0,
        monthlyTotal: 0,
    } as SummaryData,
});

/* util */
const initSummaryData = () => {
    state.createdSummaryData.increase = 0;
    state.createdSummaryData.dailyAverage = 0;
    state.createdSummaryData.monthlyTotal = 0;

    state.resolvedSummaryData.increase = 0;
    state.resolvedSummaryData.dailyAverage = 0;
    state.resolvedSummaryData.monthlyTotal = 0;
};
const setSummaryData = (current, results) => {
    initSummaryData();
    const currentMonthData = find(results, { date: current.format('YYYY-MM') });
    if (!currentMonthData) {
        return;
    }

    const daysInMonth = current.daysInMonth();
    state.createdSummaryData.monthlyTotal = currentMonthData.total_count;
    state.createdSummaryData.dailyAverage = numberFormatter(currentMonthData.total_count / daysInMonth);
    state.resolvedSummaryData.monthlyTotal = currentMonthData.resolved_count;
    state.resolvedSummaryData.dailyAverage = numberFormatter(currentMonthData.resolved_count / daysInMonth);

    // get increase/decrease count if not this month
    if (current.format('YYYY-MM') !== dayjs.utc().format('YYYY-MM')) {
        const prevMonthData = find(results, { date: current.subtract(1, 'month').format('YYYY-MM') });
        if (prevMonthData) {
            state.createdSummaryData.increase = currentMonthData.total_count - prevMonthData.total_count;
            state.resolvedSummaryData.increase = currentMonthData.resolved_count - prevMonthData.resolved_count;
        } else {
            state.createdSummaryData.increase = currentMonthData.total_count;
            state.resolvedSummaryData.increase = currentMonthData.resolved_count;
        }
    }
};

/* api */
const getAlertHistorySummary = async () => {
    try {
        const current = state.currentDate.startOf('month');
        const { results } = await SpaceConnector.client.monitoring.dashboard.alertHistorySummary({
            start: current.subtract(1, 'month').format('YYYY-MM-01'),
            end: current.add(1, 'month').format('YYYY-MM-01'),
            activated_projects: props.activatedProjects,
            workspace_id: storeState.currentWorkspaceId,
        });
        setSummaryData(current, results);
    } catch (e) {
        initSummaryData();
        ErrorHandler.handleError(e);
    }
};

watchEffect(async () => {
    if (props.activatedProjects.length) {
        await getAlertHistorySummary();
    }
});

watch(() => state.currentDate, async () => {
    await getAlertHistorySummary();
});

</script>

<template>
    <div class="alert-history-widget">
        <div class="title-wrapper">
            <span class="title">
                {{ $t('MONITORING.ALERT.DASHBOARD.ALERT_HISTORY') }}
            </span>
            <p-date-pagination :date.sync="state.currentDate" />
        </div>
        <div class="content-wrapper">
            <div class="summary-wrapper">
                <p-card v-for="(item, idx) in [state.createdSummaryData, state.resolvedSummaryData]"
                        :key="`p-card-${idx}`"
                >
                    <template #header>
                        <span class="text">{{ item.name === ALERT_STATE.CREATED ? $t('MONITORING.ALERT.DASHBOARD.CREATED') : $t('MONITORING.ALERT.DASHBOARD.RESOLVED') }}</span>
                        <span v-if="item.increase"
                              class="increase-text"
                              :class="[item.increase > 0 ? 'increase' : item.increase < 0 ? 'decrease' : '']"
                        >
                            <span>{{ numberFormatter(Math.abs(item.increase)) }}</span>
                            <p-i v-if="item.increase !== 0"
                                 :name="item.increase > 0 ? 'ic_caret-up-filled-alt' : 'ic_caret-down-filled-alt'"
                                 height="0.75rem"
                                 width="0.75rem"
                                 color="inherit"
                            />
                        </span>
                    </template>
                    <div class="count-wrapper">
                        <span>{{ item.dailyAverage }}</span>
                        <span>{{ numberFormatter(item.monthlyTotal) }}</span>
                    </div>
                    <div class="label-wrapper">
                        <span>{{ $t('MONITORING.ALERT.DASHBOARD.DAILY_AVERAGE') }}</span>
                        <span class="text-right">{{ $t('MONITORING.ALERT.DASHBOARD.MONTHLY_TOTAL') }}</span>
                    </div>
                </p-card>
            </div>
            <div class="chart-wrapper col-span-9">
                <alert-dashboard-alert-history-widget-chart
                    :current-date="state.currentDate"
                    :activated-projects="props.activatedProjects"
                />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.alert-history-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;
    column-gap: 1rem;

    .title-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 1rem;

        .title {
            @apply text-gray-900;
            font-size: 1rem;
            line-height: 1.6;
            font-weight: bold;
        }
    }

    .content-wrapper {
        @apply grid grid-cols-12;
        column-gap: 1rem;

        .summary-wrapper {
            @apply col-span-3 grid grid-cols-12;
            row-gap: 0.5rem;
            column-gap: 1rem;

            /* custom design-system component - p-card */
            :deep(.p-card) {
                @apply col-span-12;
                width: 100%;

                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    line-height: 1.2;

                    .text {
                        @apply text-gray-900;
                        font-size: 0.875rem;
                    }
                    .increase-text {
                        @apply text-gray-600;

                        &.increase {
                            @apply text-alert;
                        }
                        &.decrease {
                            @apply text-secondary;
                        }
                    }
                }

                .body {
                    line-height: 1;
                    padding: 0.5rem 1rem;

                    .count-wrapper {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .label-wrapper {
                        @apply text-gray-500;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 0.75rem;
                        margin-top: 0.5rem;
                    }
                }
            }
        }
    }

    @screen tablet {
        .content-wrapper {
            .summary-wrapper {
                grid-column: span 12 / span 12;
                grid-row-start: 2;

                /* custom design-system component - p-card */
                :deep(.p-card) {
                    grid-column: span 6 / span 6;
                }
            }

            .chart-wrapper {
                grid-column: span 12 / span 12;
                grid-row-start: 1;
                height: 12rem;
                padding-bottom: 1rem;
            }
        }
    }

    @screen mobile {
        .content-wrapper {
            .summary-wrapper {
                /* custom design-system component - p-card */
                :deep(.p-card) {
                    grid-column: span 12 / span 12;
                }
            }
        }
    }
}
</style>
