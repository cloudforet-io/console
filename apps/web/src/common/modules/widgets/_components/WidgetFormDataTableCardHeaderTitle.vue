<script setup lang="ts">

import { computed, reactive } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import {
    PIconButton, PI, PTextInput, PTooltip,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { useWidgetQuery } from '@/common/modules/widgets/_composables/use-widget-query';
import {
    DATA_TABLE_TYPE,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-options-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DataTableDataType } from '@/common/modules/widgets/types/widget-model';

import { gray, violet } from '@/styles/colors';




interface Props {
    dataTableId: string;
    dataType: DataTableDataType;
    dataTableName: string;
    selected: boolean;
    isLegacyDataTable?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:dataTableName', value: string): void;}>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    widget,
    fetcher: widgetFetcher,
    keys: widgetKeys,
} = useWidgetQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const {
    dataTableList,
    keys: dataTableKeys,
    fetcher: dataTableFetcher,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const queryClient = useQueryClient();


const storeState = reactive({
    currentDataTable: computed(() => dataTableList.value.find((dataTable) => dataTable.data_table_id === props.dataTableId)),
});

const state = reactive({
    isUnsavedTransformed: computed(() => props.dataType === DATA_TABLE_TYPE.TRANSFORMED && props.dataTableId.startsWith('UNSAVED-')),
});

const dataTableNameState = reactive({
    editMode: false,
    proxyDataTableName: useProxyValue('dataTableName', props, emit),
});

/* Events */
const handleSelectDataTable = async (dataTableId: string) => {
    if (state.isUnsavedTransformed) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.SELECT_DATA_TABLE_WARNING'), '');
        return;
    }
    if (widgetGenerateState.selectedDataTableId === dataTableId) return;

    const _widgetOptions = cloneDeep(widget.value?.options);
    const sanitizedOptions = sanitizeWidgetOptions(_widgetOptions, widget.value?.widget_type, storeState.currentDataTable);
    await updateWidget({
        widget_id: widgetGenerateState.widgetId as string,
        state: 'INACTIVE',
        options: sanitizedOptions,
    });
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
};
const handleUpdateDataTableName = (value: string) => {
    if (value.length <= 60) {
        dataTableNameState.proxyDataTableName = value;
    }
};
const handleClickNameEdit = () => {
    dataTableNameState.editMode = true;
};
const handleClickNameConfirm = async () => {
    const editedDataTableName = dataTableNameState.proxyDataTableName.trim();
    if (storeState.currentDataTable?.name === editedDataTableName) {
        dataTableNameState.editMode = false;
        return;
    }
    const dataTableNames = dataTableList.value.map((dataTable) => dataTable.name);
    if (dataTableNames.includes(editedDataTableName)) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.DATA_TABLE_NAME_WARNING'), '');
        return;
    }

    if (state.isUnsavedTransformed) {
        const unsavedDataTable = {
            ...storeState.currentDataTable,
            name: editedDataTableName,
        } as DataTableModel;
        await syncDataTableList(unsavedDataTable);
    } else {
        updateDataTable({
            data_table_id: props.dataTableId,
            name: editedDataTableName,
        });
    }
};

/* Api */
const { mutateAsync: updateWidget } = useMutation({
    mutationFn: widgetFetcher.updateWidgetFn,
    onSuccess: (data) => {
        const widgetQueryKey = widgetGenerateState.widgetId?.startsWith('private')
            ? widgetKeys.privateWidgetGetQueryKey
            : widgetKeys.publicWidgetGetQueryKey;
        queryClient.setQueryData(widgetQueryKey.value, () => data);
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
});
const { mutate: updateDataTable } = useMutation({
    mutationFn: dataTableFetcher.updateDataTableFn,
    onSuccess: async (data) => {
        await syncDataTableList(data);
        showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.DATA_TABLE_NAME_SUCCESS'), '');
        dataTableNameState.editMode = false;
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
});
const syncDataTableList = async (data: DataTableModel) => {
    const _isPrivate = widgetGenerateState.widgetId?.startsWith('private');
    const dataTableListQueryKey = _isPrivate ? dataTableKeys.privateDataTableListQueryKey : dataTableKeys.publicDataTableListQueryKey;
    await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<WidgetModel>) => {
        if (oldData.results) {
            return {
                ...oldData,
                results: oldData.results.map((dataTable) => {
                    if (dataTable.data_table_id === data.data_table_id) {
                        return data;
                    }
                    return dataTable;
                }),
            };
        }
        return oldData;
    });
};

</script>

<template>
    <div class="widget-form-data-table-card-header-title">
        <button class="selected-radio-icon"
                @click="handleSelectDataTable(props.dataTableId)"
        >
            <p-i :name="props.selected ? 'ic_checkbox-circle-selected' : 'ic_radio'"
                 :color="`${props.selected ? violet[500] : gray[400]} white`"
                 size="md"
            />
        </button>
        <div v-if="dataTableNameState.editMode"
             class="data-table-name-form"
        >
            <p-i class="data-table-icon"
                 :name="props.dataType === DATA_TABLE_TYPE.ADDED ? 'ic_service_data-sources' : 'ic_transform-data'"
                 width="1.25rem"
                 height="1.25rem"
            />
            <p-text-input :value="dataTableNameState.proxyDataTableName"
                          class="name-input"
                          size="sm"
                          block
                          :is-focused="state.isUnsavedTransformed"
                          @update:value="handleUpdateDataTableName"
                          @keydown.enter="handleClickNameConfirm"
            />
            <p-icon-button name="ic_check"
                           size="sm"
                           @click="handleClickNameConfirm"
            />
        </div>
        <div v-else
             class="data-table-name-wrapper"
        >
            <p-i class="data-table-icon"
                 :name="props.dataType === DATA_TABLE_TYPE.ADDED ? 'ic_service_data-sources' : 'ic_transform-data'"
                 width="1.25rem"
                 height="1.25rem"
            />
            <p-tooltip class="data-table-name"
                       :contents="storeState.currentDataTable?.name"
            >
                <p>
                    {{ storeState.currentDataTable?.name }}
                </p>
            </p-tooltip>
            <p-icon-button class="edit-button"
                           style-type="transparent"
                           :disabled="props.isLegacyDataTable"
                           name="ic_edit-text"
                           size="sm"
                           @click="handleClickNameEdit"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-header-title {
    @apply flex items-center text-paragraph-sm font-bold w-full;
    gap: 0.125rem;
    .selected-radio-icon {
        @apply text-white;
        width: 1.5rem;
        height: 1.5rem;
    }
    .data-table-name-wrapper {
        @apply inline-flex items-center gap-1;
        overflow: hidden;
        width: auto;
        .data-table-name {
            @apply text-paragraph-md;
            overflow: hidden;
            p {
                @apply truncate;
            }
        }
        .data-table-icon {
            min-width: 1.25rem;
            margin-right: 0.125rem;
        }
    }
    .data-table-name-form {
        @apply flex items-center;
        width: calc(100% - 1.625rem);
        gap: 0.0625rem;

        .data-table-icon {
            min-width: 1.25rem;
            margin-right: 0.125rem;
        }

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            @apply font-normal;
            .tag-container {
                padding: 0;
            }
        }
    }
}
</style>
