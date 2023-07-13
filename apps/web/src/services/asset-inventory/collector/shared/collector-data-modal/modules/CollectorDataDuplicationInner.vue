<template>
    <div class="collector-data-duplication-inner">
        <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_DESCRIPTION') }}</span>
        <p-definition-table :fields="definitionFields"
                            :data="state"
                            :class="['data-collection-information-table', { 'is-account-type-all': collectorDataModalState.accountType === ATTACHED_ACCOUNT_TYPE.ALL}]"
                            style-type="white"
                            disable-copy
        >
            <template #data-account>
                <div class="accounts-wrapper">
                    <p-lazy-img :src="props.item.plugin ? props.item.plugin.icon : ''"
                                width="1rem"
                                height="1rem"
                                class="plugin-icon"
                    />
                    <span>{{ props.item.name }}</span>
                </div>
            </template>
            <template #data-duration>
                <span>{{ state.duration }}</span>
            </template>
        </p-definition-table>
        <div v-if="collectorDataModalState.accountType === ATTACHED_ACCOUNT_TYPE.ALL"
             class="in-progress-wrapper"
        >
            <span class="in-progress-title">
                <p-i
                    name="ic_circle"
                    height="0.875rem"
                    width="0.875rem"
                    animation="spin"
                />
                <b>{{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }}</b>
            </span>
            <div class="chart-wrapper">
                <div class="label-wrapper">
                    <div v-if="state.jobTaskStatus.succeeded >= 0">
                        <p-status :icon-color="SUCCEEDED_COLOR" />
                        <span>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.SUCCEEDED') }}
                            <strong>{{ state.jobTaskStatus.succeeded }}</strong>
                        </span>
                    </div>
                    <div v-if="state.jobTaskStatus.failed >= 0"
                         class="label"
                    >
                        <p-status :icon-color="FAILED_COLOR" />
                        <span :style="{'color': FAILED_COLOR}">
                            {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FAILED') }}
                            <strong>{{ state.jobTaskStatus.failed }}</strong>
                        </span>
                    </div>
                    <span class="total-text">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.TOTAL') }}
                        <strong>{{ state.jobTaskStatus.total }}</strong>
                    </span>
                </div>
                <div class="progress-bar">
                    <span class="succeeded-bar"
                          :style="{ width: `${state.status.succeededPercentage}%` }"
                    />
                    <span class="failed-bar"
                          :style="{ width: `${state.status.failedPercentage}%` }"
                    />
                </div>
            </div>
        </div>
        <div v-else>
            <span class="in-progress-title">
                <p-i
                    name="ic_circle"
                    height="0.875rem"
                    width="0.875rem"
                    animation="spin"
                />
                <span>{{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }}</span>
            </span>
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
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { coral, green } from '@/styles/colors';

import { JOB_STATUS } from '@/services/asset-inventory/collector/collector-history/lib/config';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import type { CollectorData } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';
import { ATTACHED_ACCOUNT_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

const SUCCEEDED_COLOR = green[400];
const FAILED_COLOR = coral[400];

interface Props {
    item?: CollectorData;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

const definitionFields = [
    { label: 'Account', name: 'account' },
    { label: 'Duration', name: 'duration' },
];

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});
const state = reactive({
    jobTaskStatus: {
        succeeded: 0,
        failed: 0,
        total: 0,
    },
    duration: 0,
    status: {
        succeededPercentage: computed(() => {
            if (state.jobTaskStatus.total > 0) {
                return (state.jobTaskStatus.succeeded / state.jobTaskStatus.total) * 100;
            }
            return 0;
        }),
        failedPercentage: computed(() => {
            if (state.jobTaskStatus.total > 0) {
                const status = collectorDataModalState.recentJob.status;
                if (status === JOB_STATUS.success || status === JOB_STATUS.created) {
                    return 100 - state.status.succeededPercentage;
                }
                return (state.jobTaskStatus.failed / state.jobTaskStatus.total) * 100;
            }
            return 0;
        }),
    },
});

/* Query helper */
const apiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true);

/* API */
const getJobProgress = async () => {
    try {
        const response = await SpaceConnector.client.inventory.job.getJobProgress({
            job_id: collectorDataModalState.recentJob.job_id,
        });
        state.jobTaskStatus = response.job_task_status;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const getJobLists = async () => {
    try {
        const response = await SpaceConnector.client.inventory.job.list({ query: apiQueryHelper.data });
        const item = response.results[0];
        state.duration = durationFormatter(item.created_at, dayjs(), storeState.timezone) || '--';
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Init */
(async () => {
    await getJobLists();
    await getJobProgress();
})();
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

    /* custom design-system component - p-definition-table */
    :deep(.p-definition-table) {
        .p-definition {
            .key {
                width: 7rem;
            }
            .value-wrapper {
                flex: 1;
                max-width: initial;
            }
        }
    }
}
</style>
