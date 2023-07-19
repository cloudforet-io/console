<template>
    <p-pane-layout class="job-status-chart">
        <div class="status-wrapper">
            <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.STATUS') }}</span>
            <span v-if="status"
                  class="value"
            >
                <p-i
                    :name="statusIconFormatter(status)"
                    width="1rem"
                    height="1rem"
                    :animation="status === JOB_STATE.IN_PROGRESS ? 'spin' : undefined"
                    :color="status === JOB_STATE.SUCCESS ? SUCCEEDED_COLOR : undefined"
                />
                {{ statusText }}
            </span>
        </div>
        <div class="chart-wrapper">
            <div class="label-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.TASK') }}</span>
                <template v-if="succeededCount > 0">
                    <p-status :icon-color="SUCCEEDED_COLOR" />
                    <span>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.SUCCEEDED') }} <strong>{{ succeededCount }}</strong></span>
                </template>
                <template v-if="failedCount > 0">
                    <p-status :icon-color="FAILED_COLOR" />
                    <span :style="{'color': FAILED_COLOR}">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FAILED') }} <strong>{{ failedCount }}</strong></span>
                </template>
                <span class="total-text">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.TOTAL') }} <strong>{{ totalCount }}</strong></span>
            </div>
            <div class="progress-bar">
                <span class="succeeded-bar"
                      :style="{ width: `${succeededPercentage}%` }"
                />
                <span class="failed-bar"
                      :style="{ width: `${failedPercentage}%` }"
                />
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed,
    getCurrentInstance,
    onActivated,
    onDeactivated,
    reactive,
    toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PPaneLayout, PStatus, PI } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { coral, green } from '@/styles/colors';

import { JOB_STATE } from '@/services/asset-inventory/collector/type';

const SUCCEEDED_COLOR = green[400];
const FAILED_COLOR = coral[400];

export default {
    name: 'JobStatusChart',
    components: {
        PPaneLayout,
        PStatus,
        PI,
    },
    props: {
        jobId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            job: {},
            status: computed(() => state.job.job_status),
            statusText: computed(() => {
                if (state.status === JOB_STATE.IN_PROGRESS) return vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.IN_PROGRESS');
                if ([JOB_STATE.SUCCESS].includes(state.status)) return vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.COMPLETED');
                return vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FAILED');
            }),
            succeededCount: computed(() => state.job.job_task_status?.succeeded || 0),
            failedCount: computed(() => state.job.job_task_status?.failed || 0),
            totalCount: computed(() => state.job.job_task_status?.total),
            succeededPercentage: computed(() => {
                if (state.totalCount > 0) {
                    return (state.succeededCount / state.totalCount) * 100;
                }
                return 0;
            }),
            failedPercentage: computed(() => {
                if (state.totalCount > 0) {
                    if ([JOB_STATE.SUCCESS].includes(state.status)) {
                        return 100 - state.succeededPercentage;
                    }
                    return (state.failedCount / state.totalCount) * 100;
                }
                return 0;
            }),
        });

        /* util */
        const statusIconFormatter = (status) => {
            if (status === JOB_STATE.SUCCESS) return 'ic_check';
            if (status === JOB_STATE.IN_PROGRESS) return 'ic_gear-filled';
            return 'ic_error-filled';
        };

        /* api */
        let interval;
        const getJob = async () => {
            try {
                state.job = await SpaceConnector.client.inventory.job.getJobProgress({
                    job_id: props.jobId,
                });
                if (state.status !== JOB_STATE.IN_PROGRESS && interval) {
                    clearInterval(interval);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.job = {};
            }
        };

        /* Init */
        onActivated(async () => {
            await getJob();

            if (state.status === JOB_STATE.IN_PROGRESS) {
                interval = setInterval(() => {
                    getJob();
                }, 5000);
            }
        });

        onDeactivated(() => {
            if (interval) clearInterval(interval);
        });

        return {
            ...toRefs(state),
            statusIconFormatter,
            JOB_STATE,
            SUCCEEDED_COLOR,
            FAILED_COLOR,
        };
    },
};
</script>

<style lang="postcss" scoped>
.job-status-chart {
    @apply rounded-lg;
    padding: 1rem;

    .status-wrapper {
        display: flex;
        font-size: 0.875rem;
        padding-bottom: 1rem;

        .label {
            @apply text-gray-600;
            margin-right: 0.5rem;
        }
        .value {
            display: flex;
            font-weight: bold;

            .p-i-icon {
                margin-right: 0.25rem;
            }
        }
    }

    .chart-wrapper {
        @apply bg-blue-100 rounded-lg;
        font-size: 0.875rem;
        padding: 1rem 1.5rem;

        .label-wrapper {
            @apply text-gray-700;
            position: relative;
            display: flex;

            .label {
                @apply text-gray-900;
                padding-right: 0.5rem;
            }
            .p-status {
                margin-left: 0.5rem;
            }
            .total-text {
                position: absolute;
                right: 0;
            }
        }

        .progress-bar {
            @apply bg-gray-200;
            display: inline-flex;
            width: 100%;
            height: 0.5rem;
            margin-top: 0.5rem;

            .succeeded-bar {
                @apply bg-green-400;
                height: 100%;
            }
            .failed-bar {
                @apply bg-coral-400;
                height: 100%;
            }
        }
    }
}
</style>
