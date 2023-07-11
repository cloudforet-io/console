<template>
    <div class="collector-data-duplication-inner">
        <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_DESCRIPTION') }}</span>
        <p-definition-table :fields="definitionFields"
                            :data="tableState.definitionData"
                            :class="['data-collection-information-table', { 'is-account-type-all': props.accountType === ACCOUNT_TYPE.ALL}]"
                            style-type="white"
                            disable-copy
        >
            <template #data-status>
                <div v-if="props.accountType === ACCOUNT_TYPE.ALL"
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
                            <div v-if="tableState.definitionData.status.succeededCount > 0">
                                <p-status :icon-color="SUCCEEDED_COLOR" />
                                <span>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.SUCCEEDED') }} <strong>{{ tableState.definitionData.status.succeededCount }}</strong></span>
                            </div>
                            <div v-if="tableState.definitionData.status.failedCount > 0"
                                 class="label"
                            >
                                <p-status :icon-color="FAILED_COLOR" />
                                <span :style="{'color': FAILED_COLOR}">
                                    {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FAILED') }} =
                                    <strong>{{ tableState.definitionData.status.failedCount }}</strong>
                                </span>
                            </div>
                            <span class="total-text">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.TOTAL') }} <strong>100</strong></span>
                        </div>
                        <div class="progress-bar">
                            <span class="succeeded-bar"
                                  :style="{ width: `${tableState.definitionData.status.succeededPercentage}%` }"
                            />
                            <span class="failed-bar"
                                  :style="{ width: `${tableState.definitionData.status.failedPercentage}%` }"
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
            </template>
        </p-definition-table>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDefinitionTable, PI, PStatus } from '@spaceone/design-system';

import { coral, green } from '@/styles/colors';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

const SUCCEEDED_COLOR = green[400];
const FAILED_COLOR = coral[400];

interface Props {
    accountType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    accountType: ACCOUNT_TYPE.ALL,
});

const tableState = reactive({
    definitionData: computed(() => ({
        account: '123',
        duration: 10,
        status: {
            succeededCount: 5,
            failedCount: 2,
            totalCount: 15,
            succeededPercentage: 50,
            failedPercentage: 20,
        },
    })),
});

const definitionFields = [
    {
        label: 'Account',
        name: 'account',
    },
    {
        label: 'Duration',
        name: 'duration',
    },
    {
        label: 'Status',
        name: 'status',
    },
];
</script>

<style lang="postcss" scoped>
.collector-data-duplication-inner {
    padding-top: 1rem;
    padding-bottom: 1rem;
    .data-collection-information-table {
        margin-top: 0.5rem;
        min-height: initial;
        .in-progress-title {
            @apply flex items-center;
            gap: 0.25rem;
        }
        .in-progress-wrapper {
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
        &.is-account-type-all {
            .p-definition:last-child {
                .key {
                    display: none;
                }
                .value-wrapper {
                    display: initial;
                }
            }
        }
    }
}
</style>
