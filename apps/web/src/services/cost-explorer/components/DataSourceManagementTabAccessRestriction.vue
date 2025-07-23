<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation } from '@tanstack/vue-query';

import { PHeading, PToggleButton, PButtonModal } from '@cloudforet/mirinae';

import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useDataSourceGetQuery } from '@/services/cost-explorer/composables/use-data-source-get-query';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';

type DataType = {
    label: TranslateResult|string;
    name: string;
    disabled?: boolean;
};

interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

const { dataSourceAPI } = useDataSourceApi();

const state = reactive({
    loading: false,
    costInfo: computed(() => dataSourceData.value?.plugin_info?.metadata?.cost_info || {}),
    dataType: computed<DataType[]>(() => {
        const costDataSourceCostInfo = state.costInfo;
        const costDataKeys = dataSourceData.value?.cost_data_keys || [];

        const customDataType = costDataKeys.map((key) => ({
            label: key.replace(/([A-Z])/g, ' $1').trim(),
            name: key,
            disabled: false,
        }));

        return [
            { label: costDataSourceCostInfo?.name ?? i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COST'), name: 'cost', disabled: true },
            { label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.USAGE'), name: 'usage', disabled: true },
            ...customDataType,
        ];
    }),
    fixedDataTypeEnable: {
        cost: true,
        usage: true,
    },
    dataTypeEnable: computed(() => ({
        ...state.fixedDataTypeEnable,
        ...convertDataKey(dataSourceData.value?.cost_data_keys || []),
    })),
    selectedDataType: '',
    modalVisible: false,
});

/* Query */
const { dataSourceData } = useDataSourceGetQuery(computed(() => dataSourcesPageState.selectedDataSourceId));

/* Mutation */
const { mutateAsync: updatePermissions } = useMutation({
    mutationFn: dataSourceAPI.updatePermissions,
    onSuccess: () => {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_CHANGE_TOGGLE'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
});

const convertDataKey = (keys: string[]) => {
    const result = {};
    keys.forEach((key) => {
        result[key] = !dataSourceData.value?.permissions?.deny?.includes(`data.${key}`);
    });
    return result;
};
const handleChangeToggle = async (item: string, value: boolean) => {
    state.selectedDataType = item as string;
    state.dataTypeEnable[item] = value;
    if (value) {
        state.modalVisible = true;
    } else {
        updatePermissions({
            data_source_id: dataSourcesPageState.selectedDataSourceId || '',
            permissions: {
                deny: [...dataSourceData.value?.permissions?.deny || [], `data.${state.selectedDataType}`],
            },
        });
    }
};

const handleClose = () => {
    state.dataTypeEnable[state.selectedDataType] = false;
    state.selectedDataType = '';
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        const denyList = dataSourceData.value?.permissions?.deny || [];
        const costDataKeys = dataSourceData.value?.cost_data_keys || [];
        const updatedDenyList = denyList.filter((denyItem) => {
            const key = denyItem.replace('data.', '');
            return !costDataKeys.includes(key);
        });
        await updatePermissions({
            data_source_id: dataSourcesPageState.selectedDataSourceId || '',
            permissions: {
                deny: updatedDenyList,
            },
        });
        state.modalVisible = false;
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <div class="data-source-management-tab-access-restriction">
        <p-heading heading-type="sub"
                   :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_RESTRICTION')"
                   class="pt-8 px-4 pb-4"
        />
        <div class="contents-wrapper">
            <strong class="desc">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESTRICTION_DESC') }}</strong>
            <div v-for="(item, idx) in state.dataType"
                 :key="idx"
                 class="data-type-card"
            >
                <p-toggle-button :value="state.dataTypeEnable[item.name]"
                                 class="toggle-button"
                                 :disabled="!props.hasReadWriteAccess || item.disabled"
                                 @change-toggle="handleChangeToggle(item.name, $event)"
                />
                <span>
                    {{ item.label }}
                    <span v-if="item.name === 'cost' && !state.costInfo?.name"
                          class="extra"
                    >
                        ({{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ACTUAL_COST') }})
                    </span>
                </span>
            </div>
        </div>
        <p-button-modal
            :header-title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.MODAL_TITLE')"
            centered
            size="sm"
            fade
            backdrop
            :visible.sync="state.modalVisible"
            :loading="state.loading"
            @confirm="handleConfirm"
            @close="handleClose"
            @cancel="handleClose"
        >
            <template #body>
                <p class="modal-body">
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.MODAL_CONTENT') }}
                </p>
            </template>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.data-source-management-tab-access-restriction {
    .contents-wrapper {
        @apply flex flex-col text-label-md;
        margin-top: 0.5rem;
        margin-right: 1rem;
        margin-left: 1rem;
        gap: 0.5rem;
        .data-type-card {
            @apply flex items-center border border-gray-200;
            max-width: 35rem;
            padding: 0.75rem;
            border-radius: 0.375rem;
            gap: 0.75rem;
            .extra {
                @apply text-gray-500;
            }
        }
    }
}
</style>
