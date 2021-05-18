<template>
    <p-pane-layout class="job-status-chart">
        <div class="status-wrapper">
            <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.STATUS') }}</span>
            <span class="value">
                <p-status
                    v-if="!loading"
                    :icon="status === JOB_STATUS.success ? 'ic_state_active' : undefined"
                    :lottie="statusLottieFormatter(status)"
                    :text="statusText"
                    :icon-color="SUCCEEDED_COLOR"
                    :theme="[JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout].includes(status) ? 'red' : undefined"
                />
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
                <span class="succeeded-bar" :style="{ width: `${succeededPercentage}%` }" />
                <span class="failed-bar" :style="{ width: `${failedPercentage}%` }" />
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, reactive, toRefs, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import { PPaneLayout, PStatus } from '@spaceone/design-system';

import { JOB_STATUS } from '@/views/management/collector-history/pages/config';
import { SpaceConnector } from '@/lib/space-connector';
import { coral, green } from '@/styles/colors';


const SUCCEEDED_COLOR = green[400];
const FAILED_COLOR = coral[500];

export default {
    name: 'JobStatusChart',
    components: {
        PPaneLayout,
        PStatus,
    },
    props: {
        jobId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            job: {},
            status: computed(() => state.job?.status),
            statusText: computed(() => {
                if (state.status === JOB_STATUS.progress) return vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.IN_PROGRESS');
                if ([JOB_STATUS.success, JOB_STATUS.created].includes(state.status)) return vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.COMPLETED');
                return vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FAILED');
            }),
            succeededCount: 22,
            failedCount: 10,
            totalCount: 32,
            succeededPercentage: computed(() => {
                if (state.totalCount > 0) {
                    return (state.succeededCount / state.totalCount) * 100;
                }
                return 0;
            }),
            failedPercentage: computed(() => {
                if (state.totalCount > 0) {
                    if ([JOB_STATUS.success, JOB_STATUS.created].includes(state.status)) {
                        return 100 - state.succeededPercentage;
                    }
                    return (state.failedCount / state.totalCount) * 100;
                }
                return 0;
            }),
        });

        /* util */
        const statusLottieFormatter = (status) => {
            if ([JOB_STATUS.success, JOB_STATUS.created].includes(status)) return undefined;
            if (status === JOB_STATUS.progress) return 'lottie_in_progress';
            return 'lottie_error';
        };

        /* api */
        const getJob = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.job.list({
                    job_id: props.jobId,
                });
                state.job = res.results[0] || {};
            } catch (e) {
                state.job = {};
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await getJob();
        })();

        return {
            ...toRefs(state),
            statusLottieFormatter,
            JOB_STATUS,
            SUCCEEDED_COLOR,
            FAILED_COLOR,
        };
    },
};
</script>

<style lang="postcss" scoped>
.job-status-chart {
    border-radius: 0.375rem;
    padding: 1rem;

    .status-wrapper {
        display: flex;
        font-size: 0.875rem;
        padding-bottom: 1rem;

        .label {
            @apply text-gray-600;
            margin-right: 0.5rem;
        }
    }

    .chart-wrapper {
        @apply bg-blue-100;
        font-size: 0.875rem;
        border-radius: 0.375rem;
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
                @apply bg-coral-500;
                height: 100%;
            }
        }
    }
}
</style>
