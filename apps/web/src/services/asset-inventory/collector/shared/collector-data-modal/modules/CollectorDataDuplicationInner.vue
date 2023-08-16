<template>
    <div class="collector-data-duplication-inner">
        <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_DESCRIPTION') }}</span>
        <p-definition-table :fields="definitionFields"
                            :data="state"
                            :class="['data-collection-information-table', { 'is-single-account': collectorDataModalState.collectDataType === COLLECT_DATA_TYPE.SINGLE}]"
                            custom-key-width="7rem"
                            style-type="white"
                            disable-copy
        >
            <template #data-account>
                <div class="accounts-wrapper">
                    <p-lazy-img :src="props.icon"
                                width="1rem"
                                height="1rem"
                                class="plugin-icon"
                    />
                    <span>{{ props.name }}</span>
                </div>
            </template>
            <template #data-duration>
                <span>{{ state.duration }}</span>
            </template>
            <template #data-status>
                <span class="in-progress-title">
                    <p-i key="ic_peacock-gradient-circle"
                         name="ic_peacock-gradient-circle"
                         height="1rem"
                         width="1rem"
                         animation="spin"
                    />
                    <span>{{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }}</span>
                </span>
            </template>
        </p-definition-table>
        <div v-if="collectorDataModalState.collectDataType === COLLECT_DATA_TYPE.ENTIRE"
             class="in-progress-wrapper"
        >
            <span class="in-progress-title">
                <p-i key="ic_peacock-gradient-circle"
                     name="ic_peacock-gradient-circle"
                     height="1rem"
                     width="1rem"
                     animation="spin"
                />
                <b>{{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }}</b>
            </span>
            <div class="chart-wrapper">
                <div class="label-wrapper">
                    <div v-if="state.recentJob.success_tasks >= 0">
                        <p-status :icon-color="SUCCEEDED_COLOR" />
                        <span>{{ $t('INVENTORY.COLLECTOR.HISTORY.SUCCESS') }}
                            <strong>{{ state.recentJob.success_tasks }}</strong>
                        </span>
                    </div>
                    <div v-if="state.recentJob.failure_tasks >= 0"
                         class="label"
                    >
                        <p-status :icon-color="FAILED_COLOR" />
                        <span :style="{'color': FAILED_COLOR}">
                            {{ $t('INVENTORY.COLLECTOR.HISTORY.FAILURE') }}
                            <strong>{{ state.recentJob.failure_tasks }}</strong>
                        </span>
                    </div>
                    <span class="total-text">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.TOTAL') }}
                        <strong>{{ state.recentJob.total_tasks }}</strong>
                    </span>
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
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PDefinitionTable, PI, PLazyImg, PStatus,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { durationFormatter } from '@cloudforet/core-lib';

import { store } from '@/store';

import { red, green } from '@/styles/colors';

import { useCollectorDataModalStore } from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';

const SUCCEEDED_COLOR = green[500];
const FAILED_COLOR = red[400];

interface Props {
    name: string;
    icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    icon: '',
});

const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

const definitionFields = computed(() => {
    const defaultField = [
        { label: 'Account', name: 'account' },
        { label: 'Duration', name: 'duration' },
    ];
    return collectorDataModalState.collectDataType === COLLECT_DATA_TYPE.ENTIRE
        ? defaultField
        : [
            ...defaultField,
            { label: 'Status', name: 'status' },
        ];
});

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});
const state = reactive({
    recentJob: computed(() => collectorDataModalState.recentJob),
    duration: computed(() => durationFormatter(state.recentJob?.created_at, dayjs(), storeState.timezone) || '--'),
    succeededPercentage: computed(() => {
        if (state.recentJob.total_tasks > 0) {
            return (state.recentJob.success_tasks / state.recentJob.total_tasks) * 100;
        }
        return 0;
    }),
    failedPercentage: computed(() => {
        if (state.recentJob.total_tasks > 0) {
            if (state.recentJob.status === JOB_STATE.SUCCESS) {
                return 100 - state.succeededPercentage;
            }
            return (state.recentJob.failure_tasks / state.recentJob.total_tasks) * 100;
        }
        return 0;
    }),
});
</script>

<style lang="postcss" scoped>
.collector-data-duplication-inner {
    padding-top: 1rem;
    padding-bottom: 1rem;
    .data-collection-information-table {
        margin-top: 0.5rem;
        min-height: initial;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        .accounts-wrapper {
            @apply flex items-center;
            gap: 0.5rem;
        }
        &.is-single-account {
            border-bottom-left-radius: 0.375rem;
            border-bottom-right-radius: 0.375rem;
        }
    }
    .in-progress-wrapper {
        @apply border border-gray-200;
        border-top: 0;
        padding: 1rem;
        border-bottom-left-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
        .in-progress-title {
            @apply flex items-center;
            gap: 0.25rem;
        }
        .chart-wrapper {
            @apply bg-blue-100 rounded-lg;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            padding: 1rem 1.5rem;
            .label-wrapper {
                @apply relative flex text-gray-700;
                .label {
                    margin-left: 0.5rem;
                }
                .total-text {
                    @apply absolute;
                    right: 0;
                }
            }
            .progress-bar {
                @apply inline-flex bg-gray-200;
                width: 100%;
                height: 0.5rem;
                margin-top: 0.5rem;
                .succeeded-bar {
                    @apply bg-green-500;
                    height: 100%;
                }
                .failed-bar {
                    @apply bg-red-400;
                    height: 100%;
                }
            }
        }
    }
}
</style>
