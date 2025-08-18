<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';

import {
    PButtonModal, PCodeEditor, PFieldTitle, PToggleButton, PTextInput, PDatetimePicker, PScopedNotification,
} from '@cloudforet/mirinae';

import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import { useCostJobApi } from '@/api-clients/cost-analysis/job/composables/use-job-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useCostJobGetQuery } from '@/services/cost-explorer/composables/use-cost-job-get-query';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataCollectionHistoryModalType } from '@/services/cost-explorer/types/data-sources-type';


interface DateOption {
    minDate?: string;
    maxDate?: string;
}

interface Props {
    modalVisible: boolean;
    modalType: DataCollectionHistoryModalType;
    selectedJobId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modalVisible: false,
    modalType: 'ERROR',
    selectedJobId: undefined,
});

const queryClient = useQueryClient();
const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const { dataSourceAPI } = useDataSourceApi();
const { costJobAPI } = useCostJobApi();

const emit = defineEmits<{(e: 'update:modal-visible'): void;
}>();

const state = reactive({
    proxyVisible: useProxyValue('modalVisible', props, emit),
    loading: false,
    headerTitle: computed<TranslateResult>(() => {
        if (props.modalType === 'CANCEL') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.CANCEL_MODAL_TITLE');
        }
        if (props.modalType === 'RE-SYNC') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESYNC_MODAL_TITLE');
        }
        if (props.modalType === 'RESTART') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESTART_MODAL_TITLE');
        }
        return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_TITLE');
    }),
    toggleValue: true,
    thisMonthRange: computed<string>(() => {
        const start = dayjs.utc().startOf('month').format('YYYY-MM-DD');
        const end = dayjs.utc().format('YYYY-MM-DD');
        return `${start} ~ ${end}`;
    }),
    startDates: [] as string[],
    startDateSetting: computed<DateOption>(() => {
        const today = dayjs.utc();
        const minDate = today.subtract(10, 'month').format('YYYY-MM');
        const maxDate = today.format('YYYY-MM');
        return { minDate, maxDate };
    }),
    modalValidation: computed<boolean>(() => {
        if (props.modalType === 'RE-SYNC') {
            if (state.toggleValue) return false;
            return !state.startDates.length;
        }
        return false;
    }),
});

/* Query */
const { costJob, isLoading: isCostJobLoading } = useCostJobGetQuery(computed(() => props.selectedJobId));
const { key: costJobListQueryKey } = useServiceQueryKey('cost-analysis', 'job', 'list');

/* Event Handler */
const handleUpdateSelectedDates = (selectedDates: string[]) => {
    if (!selectedDates.length) return;

    state.startDates = selectedDates;
};
const handleChangeToggleButton = () => {
    state.startDates = [];
};

const handleConfirmButton = async () => {
    try {
        state.loading = true;

        switch (props.modalType) {
        case 'ERROR':
            return;

        case 'RE-SYNC':
            await dataSourceAPI.sync({
                start: state.toggleValue ? undefined : dayjs(state.startDates[0]).format('YYYY-MM'),
                data_source_id: dataSourcesPageState.selectedDataSourceId || '',
            });
            break;

        case 'CANCEL':
            if (props.selectedJobId) {
                await costJobAPI.cancel({
                    job_id: props.selectedJobId,
                });
            }
            break;

        default: break;
        }

        queryClient.invalidateQueries({ queryKey: costJobListQueryKey.value });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
        state.proxyVisible = false;
    }
};
</script>

<template>
    <p-button-modal
        :header-title="state.headerTitle"
        centered
        :size="props.modalType === 'ERROR' ? 'md' : 'sm'"
        fade
        backdrop
        :loading="state.loading || isCostJobLoading"
        :disabled="state.modalValidation"
        :hide-footer-close-button="props.modalType === 'RESTART' || props.modalType === 'ERROR'"
        :theme-color="props.modalType === 'CANCEL' || props.modalType === 'RESTART' ? 'alert' : 'primary'"
        :visible.sync="state.proxyVisible"
        class="data-source-management-tab-data-collection-history-modal"
        @confirm="handleConfirmButton"
    >
        <template #body>
            <div v-if="props.modalType === 'CANCEL' || props.modalType === 'RESTART'"
                 class="cancel-content"
            >
                <p-scoped-notification type="warning"
                                       layout="in-section"
                >
                    <span v-if="props.modalType === 'CANCEL'"
                          class="content-inner"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.CANCEL_MODAL_DESC') }}
                    </span>
                    <div v-else
                         class="content-inner"
                    >
                        <p>{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESTART_MODAL_CANCEL_DESC') }}</p>
                    </div>
                </p-scoped-notification>
            </div>
            <div v-else-if="props.modalType === 'RE-SYNC'"
                 class="re-sync-content"
            >
                <div class="field-header">
                    <p-field-title :label="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.AUTO_DATA_RANGE')"
                                   :description="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.AUTO_DATA_RANGE_DESC')"
                    />
                    <p-toggle-button :value.sync="state.toggleValue"
                                     class="toggle-button"
                                     show-state-text
                                     :disabled="state.loading"
                                     :true-state-text="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.AUTO')"
                                     :false-state-text="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.MANUAL')"
                                     @change-toggle="handleChangeToggleButton"
                    />
                    <div class="date-range-wrapper">
                        <p-text-input v-if="state.toggleValue"
                                      :value="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.THIS_MONTH', { range: state.thisMonthRange })"
                                      disabled
                                      block
                                      class="this-month-range"
                        />
                        <div v-else
                             class="date-picker-wrapper"
                        >
                            <p-datetime-picker class="datetime"
                                               :selected-dates="state.startDates"
                                               :min-date="state.startDateSetting.minDate"
                                               :max-date="state.startDateSetting.maxDate"
                                               data-type="yearToMonth"
                                               @update:selected-dates="handleUpdateSelectedDates"
                            />
                            <span> ~ </span>
                            <p-text-input :value="dayjs.utc().format('YYYY-MM')"
                                          disabled
                                          block
                                          class="datetime"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div v-else
                 class="error-content"
            >
                <p class="error-info">
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_CODE') }}:
                    <span class="error-code">
                        {{ costJob?.error_code }}
                    </span>
                </p>
                <p-code-editor read-only
                               :code="costJob?.error_message"
                />
            </div>
        </template>
        <template #confirm-button>
            <span v-if="props.modalType === 'ERROR'">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_OK') }}</span>
            <span v-else-if="props.modalType === 'CANCEL'">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.CANCEL_BUTTON') }}</span>
            <span v-else-if="props.modalType === 'RESTART'">
                {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.CANCEL') }}
            </span>
        </template>
        <template #close-button>
            <span v-if="props.modalType === 'CANCEL'">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.KEEP_COLLECTING') }}</span>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-data-collection-history-modal {
    .error-content {
        @apply flex flex-col;
        padding-bottom: 0.75rem;
        gap: 1rem;
        .error-info {
            @apply flex items-center text-label-md font-bold;
            gap: 0.5rem;
            .error-code {
                @apply text-code-md text-red-600 font-normal bg-gray-100 border border-gray-200;
                padding-right: 0.375rem;
                padding-left: 0.375rem;
                border-radius: 0.25rem;
            }
        }
    }

    .re-sync-content {
        .field-header {
            .toggle-button {
                margin-top: 0.5rem;
            }
        }
        .date-range-wrapper {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            .date-picker-wrapper {
                @apply flex items-center;
                gap: 0.5rem;
                .datetime {
                    flex: 1;
                    max-width: 12.25rem;
                }
            }
        }
    }

    .cancel-content {
        margin-top: 1.375rem;
        margin-bottom: 0.5rem;
        .content-inner {
            @apply block;
            padding-top: 0.25rem;
            padding-bottom: 0.375rem;
            .desc-title {
                @apply text-yellow-700;
            }
        }
    }

    /* custom design-system component - p-text-editor */
    :deep(.p-text-editor) {
        .CodeMirror {
            border-radius: 0.375rem;
        }
    }
}
</style>

