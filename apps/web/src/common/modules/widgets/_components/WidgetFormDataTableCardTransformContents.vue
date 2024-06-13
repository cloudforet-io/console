<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PIconButton, PI, PTextInput, PTooltip,
} from '@spaceone/design-system';

import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { gray, violet } from '@/styles/colors';



interface Props {
    selected: boolean;
    item: PublicDataTableModel|PrivateDataTableModel;
}
const props = defineProps<Props>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
// const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    dataTables: computed(() => widgetGenerateState.dataTables),
});

const state = reactive({
    dataTableId: computed(() => props.item.data_table_id),
    unsaved: computed(() => state.dataTableId.startsWith('UNSAVED-')),
    options: computed(() => props.item.options),
});

const dataTableNameState = reactive({
    editMode: false,
    dataTableName: props.item.name ?? '',
});

/* Events */
const handleSelectDataTable = async (dataTableId: string) => {
    if (state.unsaved) {
        showErrorMessage('Please save the data table first.', '');
        return;
    }
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    widgetGenerateStore.setSelectedPreviewGranularity(GRANULARITY.MONTHLY);
};
const handleUpdateDataTableName = (value: string) => {
    if (value.length <= 60) {
        dataTableNameState.dataTableName = value;
    }
};
const handleClickNameEdit = () => {
    dataTableNameState.editMode = true;
};
const handleClickNameConfirm = async () => {
    const editedDataTableName = dataTableNameState.dataTableName.trim();
    if (props.item.name === editedDataTableName) {
        dataTableNameState.editMode = false;
        return;
    }
    const dataTableNames = storeState.dataTables.map((dataTable) => dataTable.name);
    if (dataTableNames.includes(editedDataTableName)) {
        showErrorMessage('A data with this name already exists.', '');
        return;
    }
    await widgetGenerateStore.updateDataTable({
        data_table_id: state.dataTableId,
        name: editedDataTableName,
    }, state.unsaved);
    showSuccessMessage('Data name successfully changed.', '');
    dataTableNameState.editMode = false;
};

</script>

<template>
    <div class="widget-form-data-table-card-transform-contents"
         :class="{ 'selected': props.selected }"
    >
        <div class="card-header">
            <div class="title-wrapper">
                <button class="selected-radio-icon"
                        @click="handleSelectDataTable(state.dataTableId)"
                >
                    <p-i :name="props.selected ? 'ic_checkbox-circle-selected' : 'ic_radio'"
                         :color="props.selected ? violet[500] : gray[400]"
                         size="md"
                    />
                </button>
                <div v-if="dataTableNameState.editMode"
                     class="data-table-name-form"
                >
                    <p-text-input :value="dataTableNameState.dataTableName"
                                  class="name-input"
                                  size="sm"
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
                         name="ic_service_data-sources"
                         width="1.25rem"
                         height="1.25rem"
                    />
                    <p-tooltip class="data-table-name"
                               :contents="props.item.name"
                    >
                        <p>
                            {{ props.item.name }}
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
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-contents {
    @apply border border-gray-300 rounded-lg w-full bg-white;
    width: 24rem;
    margin-bottom: 2rem;

    &.selected {
        @apply border-violet-600;
        box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
    }
}
</style>
