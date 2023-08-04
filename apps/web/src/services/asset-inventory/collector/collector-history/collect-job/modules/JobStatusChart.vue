<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';

import { PPaneLayout, PStatus, PI } from '@spaceone/design-system';

import { green, red } from '@/styles/colors';

import {
    statusIconColorFormatter,
    statusIconFormatter, statusTextFormatter,
} from '@/services/asset-inventory/collector/collector-history/lib/formatter-helper';
import type { JobModel } from '@/services/asset-inventory/collector/model';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';

interface Props {
    job: JobModel;
}

const props = withDefaults(defineProps<Props>(), {
    job: undefined,
});

const state = reactive({
    succeededPercentage: computed(() => {
        if (props.job.total_tasks > 0) {
            return (props.job.success_tasks / props.job.total_tasks) * 100;
        }
        return 0;
    }),
    failedPercentage: computed(() => {
        if (props.job.total_tasks > 0) {
            if (props.job.status === JOB_STATE.SUCCESS) {
                return 100 - state.succeededPercentage;
            }
            return (props.job.failure_tasks / props.job.total_tasks) * 100;
        }
        return 0;
    }),
});
</script>

<template>
    <p-pane-layout class="job-status-chart">
        <div class="status-wrapper">
            <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.STATUS') }}</span>
            <span v-if="props.job.status"
                  class="value"
            >
                <p-i
                    :name="statusIconFormatter(props.job.status)"
                    width="1rem"
                    height="1rem"
                    :animation="props.job.status === JOB_STATE.IN_PROGRESS ? 'spin' : undefined"
                    :color="statusIconColorFormatter(props.job.status)"
                />
                {{ statusTextFormatter(props.job.status) }}
            </span>
        </div>
        <div class="chart-wrapper">
            <div class="label-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.TASK') }}</span>
                <template v-if="props.job.success_tasks > 0">
                    <p-status :icon-color="green[500]" />
                    <span>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.SUCCEEDED') }} <strong>{{ props.job.success_tasks }}</strong></span>
                </template>
                <template v-if="props.job.failure_tasks > 0">
                    <p-status :icon-color="red[400]" />
                    <span :style="{'color': red[400]}">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FAILED') }} <strong>{{ props.job.failure_tasks }}</strong></span>
                </template>
                <span class="total-text">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.TOTAL') }} <strong>{{ props.job.total_tasks }}</strong></span>
            </div>
            <div class="progress-bar">
                <span class="succeeded-bar"
                      :style="{ width: `${state.succeededPercentage}%` }"
                />
                <span class="failed-bar"
                      :style="{ width: `${state.failedPercentage}%` }"
                />
            </div>
        </div>
    </p-pane-layout>
</template>

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
