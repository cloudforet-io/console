<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PHeading, PToggleButton, PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type {
    CostDataSourceUpdatePermissionsParameters,
} from '@/schema/cost-analysis/data-source/api-verbs/update-permissions';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';


type DataType = {
    label: TranslateResult|string;
    name: string;
    disabled?: boolean;
};

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    selectedItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),
});
const state = reactive({
    loading: false,
    costInfo: computed(() => storeState.selectedItem.plugin_info?.metadata?.cost_info || {}),
    dataType: computed<DataType[]>(() => {
        const costDataSourceCostInfo = state.costInfo;
        const costDataKeys = storeState.selectedItem.cost_data_keys || [];

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
        ...convertDataKey(storeState.selectedItem.cost_data_keys || []),
    })),
    selectedDataType: '',
    modalVisible: false,
});

const convertDataKey = (keys: string[]) => {
    const result = {};
    keys.forEach((key) => {
        result[key] = !storeState.selectedItem.permissions?.deny?.includes(`data.${key}`);
    });
    return result;
};
const handleChangeToggle = async (item: string, value: boolean) => {
    state.selectedDataType = item as string;
    state.dataTypeEnable[item] = value;
    if (value) {
        state.modalVisible = true;
    } else {
        try {
            const permissions = [
                ...storeState.selectedItem.permissions?.deny || [],
                `data.${state.selectedDataType}`,
            ];
            await SpaceConnector.clientV2.costAnalysis.dataSource.updatePermissions<CostDataSourceUpdatePermissionsParameters>({
                data_source_id: storeState.selectedItem.data_source_id,
                permissions: {
                    deny: permissions,
                },
            });
            showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_CHANGE_TOGGLE'), '');
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }
};

const handleClose = () => {
    state.dataTypeEnable[state.selectedDataType] = false;
    state.selectedDataType = '';
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        const denyList = storeState.selectedItem.permissions?.deny || [];
        const costDataKeys = storeState.selectedItem.cost_data_keys || [];
        const updatedDenyList = denyList.filter((denyItem) => {
            const key = denyItem.replace('data.', '');
            return !costDataKeys.includes(key);
        });
        await SpaceConnector.clientV2.costAnalysis.dataSource.updatePermissions<CostDataSourceUpdatePermissionsParameters>({
            data_source_id: storeState.selectedItem.data_source_id,
            permissions: {
                deny: updatedDenyList,
            },
        });
        state.modalVisible = false;
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_CHANGE_TOGGLE'), '');
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
                   class="title"
        />
        <div class="contents-wrapper">
            <strong class="desc">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESTRICTION_DESC') }}</strong>
            <div v-for="(item, idx) in state.dataType"
                 :key="idx"
                 class="data-type-card"
            >
                <p-toggle-button :value="state.dataTypeEnable[item.name]"
                                 class="toggle-button"
                                 :disabled="item.disabled"
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
