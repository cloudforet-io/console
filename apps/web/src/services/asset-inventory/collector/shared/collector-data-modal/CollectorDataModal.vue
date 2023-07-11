<template>
    <div class="collector-data-modal">
        <p-button-modal :visible="collectorPageState.visibleCollectorModal"
                        :header-title="state.headerTitle"
                        :theme-color="props.isDuplicateJobs ? 'alert' : 'primary'"
                        :loading="state.loading"
                        size="sm"
                        @confirm="handleClickConfirm"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <div v-if="props.isDuplicateJobs"
                     class="duplication-content-wrapper"
                >
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
                <div v-else>
                    <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DESCRIPTION') }}</span>
                    <div class="accounts-wrapper">
                        <p-lazy-img :src="collectorDataModalStore.selectedCollector.plugin.icon"
                                    width="1rem"
                                    height="1rem"
                                    class="plugin-icon"
                        />
                        <span>{{ collectorDataModalStore.selectedCollector.name }}</span>
                        <span v-if="collectorDataModalState.secrets.length > 0">
                            ({{ collectorDataModalState.secrets.length }})
                        </span>
                    </div>
                </div>
            </template>
            <template #confirm-button>
                <span v-if="props.isDuplicateJobs">{{ $t('INVENTORY.COLLECTOR.MAIN.RESTART') }}</span>
                <span v-else>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.CONFIRM_BUTTON') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButtonModal, PLazyImg, PDefinitionTable, PI, PStatus,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { coral, green } from '@/styles/colors';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import { ACCOUNT_TYPE, COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

const SUCCEEDED_COLOR = green[400];
const FAILED_COLOR = coral[400];
interface Props {
    collectDataType?: string;
    accountType?: string;
    isDuplicateJobs?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    collectDataType: COLLECT_DATA_TYPE.COLLECTOR,
    accountType: ACCOUNT_TYPE.ALL,
    isDuplicateJobs: false,
});

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;
const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

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
const state = reactive({
    loading: false,
    headerTitle: computed(() => (props.isDuplicateJobs ? i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_TITLE') : i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.TITLE'))),
});

const emit = defineEmits<{(e: 'click-confirm'): void}>();

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

/* Components */
const handleClickCancel = () => {
    collectorPageStore.$patch({
        visibleCollectorModal: false,
    });
};
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.client.inventory.collector.collect({
            collector_id: collectorDataModalState.selectedCollector.collector_id,
            secret_id: collectorDataModalState.selectedSecret.secret_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
        throw e;
    } finally {
        state.loading = false;
        emit('click-confirm');
        handleClickCancel();
    }
};
</script>

<style lang="postcss" scoped>
.collector-data-modal {
    .duplication-content-wrapper {
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
    .accounts-wrapper {
        @apply flex items-center bg-gray-100 text-paragraph-md;
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        gap: 0.5rem;
    }
}
</style>
