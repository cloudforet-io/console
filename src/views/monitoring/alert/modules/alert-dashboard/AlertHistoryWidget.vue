<template>
    <div class="alert-history-widget">
        <div class="title-wrapper">
            <span class="title">
                {{ $t('MONITORING.ALERT.DASHBOARD.ALERT_HISTORY') }}
            </span>
            <p-date-pagination :date.sync="currentDate" />
        </div>
        <div class="content-wrapper">
            <div class="summary-wrapper">
                <p-card v-for="(item, idx) in summaryItems" :key="`p-card-${idx}`">
                    <template #header>
                        <span class="text">{{ item.name === ALERT_STATE.CREATED ? $t('MONITORING.ALERT.DASHBOARD.CREATED') : $t('MONITORING.ALERT.DASHBOARD.RESOLVED') }}</span>
                        <span class="increase-text" :class="[item.increase > 0 ? 'increase' : item.increase < 0 ? 'decrease' : '']">
                            <span>{{ Math.abs(item.increase) }}</span>
                            <p-i v-if="item.increase !== 0"
                                 :name="item.increase > 0 ? 'ic_increase' : 'ic_decrease'"
                                 height="0.75rem" width="0.75rem"
                                 color="inherit"
                            />
                        </span>
                    </template>
                    <div class="count-wrapper">
                        <span>{{ item.dailyAverage }}</span>
                        <span>{{ item.monthlyTotal }}</span>
                    </div>
                    <div class="label-wrapper">
                        <span>{{ $t('MONITORING.ALERT.DASHBOARD.DAILY_AVERAGE') }}</span>
                        <span>{{ $t('MONITORING.ALERT.DASHBOARD.MONTHLY_TOTAL') }}</span>
                    </div>
                </p-card>
            </div>
            <div class="chart-wrapper col-span-9">
                <alert-history-chart :current-date="currentDate" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { reactive, toRefs } from '@vue/composition-api';

import {
    PCard, PI, PDatePagination,
} from '@spaceone/design-system';

import AlertHistoryChart from '@/views/monitoring/alert/modules/alert-dashboard/AlertHistoryChart.vue';
import { store } from '@/store';

dayjs.extend(utc);


const ALERT_STATE = {
    CREATED: 'created',
    RESOLVED: 'resolved',
};

export default {
    name: 'AlertHistoryWidget',
    components: {
        AlertHistoryChart,
        PCard,
        PI,
        PDatePagination,
    },
    setup() {
        const state = reactive({
            currentDate: dayjs.utc(),
            summaryItems: [
                {
                    name: ALERT_STATE.CREATED,
                    increase: 1,
                    dailyAverage: 8.5,
                    monthlyTotal: 145,
                },
                {
                    name: ALERT_STATE.RESOLVED,
                    increase: -2,
                    dailyAverage: 1.3,
                    monthlyTotal: 23,
                },
            ],
        });

        return {
            ...toRefs(state),
            ALERT_STATE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-history-widget {
    @apply border border-gray-200 rounded-md;
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

            .p-card::v-deep {
                @apply col-span-12;
                width: 100%;

                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    line-height: 1.2;
                    //padding: 0.5rem 1rem;

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
                @apply col-span-12 row-start-2;

                .p-card::v-deep {
                    @apply col-span-6;
                }
            }

            .chart-wrapper {
                @apply col-span-12 row-start-1;
            }
        }
    }

    @screen mobile {
        .content-wrapper {
            .summary-wrapper {
                .p-card::v-deep {
                    @apply col-span-12;
                }
            }
        }
    }
}
</style>
