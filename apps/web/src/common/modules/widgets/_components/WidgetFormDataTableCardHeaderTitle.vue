<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PIconButton, PI, PTextInput, PTooltip,
} from '@spaceone/design-system';


import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableDataType } from '@/common/modules/widgets/types/widget-model';

import { gray, violet } from '@/styles/colors';


interface Props {
    dataTableId: string;
    dataType: DataTableDataType;
    dataTableName: string;
    selected: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:dataTableName', value: string): void;}>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const storeState = reactive({
    dataTables: computed(() => widgetGenerateState.dataTables),
    currentDataTable: computed(() => storeState.dataTables.find((dataTable) => dataTable.data_table_id === props.dataTableId)),
});

const state = reactive({
    isUnsavedTransformed: computed(() => props.dataType === DATA_TABLE_TYPE.TRANSFORMED && props.dataTableId.startsWith('UNSAVED-')),
});

const dataTableNameState = reactive({
    editMode: !!state.isUnsavedTransformed,
    proxyDataTableName: useProxyValue('dataTableName', props, emit),
});

/* Events */
const handleSelectDataTable = async (dataTableId: string) => {
    if (state.isUnsavedTransformed) {
        showErrorMessage('Please save the data table first.', '');
        return;
    }
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    widgetGenerateStore.setSelectedPreviewGranularity(GRANULARITY.MONTHLY);
    widgetGenerateStore.setWidgetFormValueMap({});
    widgetGenerateStore.setWidgetValidMap({});
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
    if (storeState.currentDataTable.name === editedDataTableName) {
        dataTableNameState.editMode = false;
        return;
    }
    const dataTableNames = storeState.dataTables.map((dataTable) => dataTable.name);
    if (dataTableNames.includes(editedDataTableName)) {
        showErrorMessage('A data with this name already exists.', '');
        return;
    }
    await widgetGenerateStore.updateDataTable({
        data_table_id: props.dataTableId,
        name: editedDataTableName,
    }, state.isUnsavedTransformed);
    showSuccessMessage('Data name successfully changed.', '');
    dataTableNameState.editMode = false;
};
</script>

<template>
    <div class="widget-form-data-table-card-header-title">
        <button class="selected-radio-icon"
                @click="handleSelectDataTable(props.dataTableId)"
        >
            <p-i :name="props.selected ? 'ic_checkbox-circle-selected' : 'ic_radio'"
                 :color="props.selected ? violet[500] : gray[400]"
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
                       :contents="storeState.currentDataTable.name"
            >
                <p>
                    {{ storeState.currentDataTable.name }}
                </p>
            </p-tooltip>
            <p-icon-button class="edit-button"
                           style-type="transparent"
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
        width: 1.5rem;
        height: 1.5rem;
    }
    .data-table-name-wrapper {
        @apply inline-flex items-center gap-1;
        overflow: hidden;
        width: auto;
        .data-table-name {
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
            @apply w-full font-normal;
            height: 1.5rem;
            .tag-container {
                padding: 0;
            }
        }
    }
}
</style>
