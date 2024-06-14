<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardTransformForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformForm.vue';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableAlertModalMode } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DataTableOperator } from '@/common/modules/widgets/types/widget-model';




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
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
});

const state = reactive({
    dataTableId: computed(() => props.item.data_table_id),
    options: computed(() => props.item.options),
    dataTableName: props.item.name ?? '',
    applyDisabled: computed(() => !state.dataTableName.length),
    optionsChanged: computed(() => false),

    operator: computed(() => props.item.operator as DataTableOperator),
});

const modalState = reactive({
    visible: false,
    mode: '' as DataTableAlertModalMode,
});


/* Events */
const handleClickDeleteDataTable = async () => {
    modalState.mode = 'DELETE';
    modalState.visible = true;
};
const handleClickResetDataTable = () => {
    modalState.mode = 'RESET';
    modalState.visible = true;
};
const handleConfirmModal = async () => {
    if (modalState.mode === 'DELETE') {
        const beforeSelectedDataTableId = storeState.selectedDataTableId;
        const deleteParams = {
            data_table_id: state.dataTableId,
        };
        await widgetGenerateStore.deleteDataTable(deleteParams);
        if (beforeSelectedDataTableId === state.dataTableId) {
            const dataTableId = storeState.dataTables.length ? storeState.dataTables[0]?.data_table_id : undefined;
            widgetGenerateStore.setSelectedDataTableId(dataTableId?.startsWith('UNSAVED-') ? undefined : dataTableId);
        }
    }
    if (modalState.mode === 'RESET') {
        setInitialDataTableForm();
    }
    modalState.visible = false;
};
const handleCancelModal = () => {
    modalState.visible = false;
};
const handleUpdateDataTable = async () => {
    modalState.visible = false;
};

/* Utils */
const setInitialDataTableForm = () => {
    console.debug('reset!');
};

</script>

<template>
    <div class="widget-form-data-table-card-transform-contents"
         :class="{ 'selected': props.selected }"
    >
        <div class="card-header">
            <widget-form-data-table-card-header-title :data-table-id="state.dataTableId"
                                                      :data-type="DATA_TABLE_TYPE.TRANSFORMED"
                                                      :selected="props.selected"
                                                      :data-table-name.sync="state.dataTableName"
            />
        </div>
        <widget-form-data-table-card-transform-form :data-table-id="state.dataTableId"
                                                    :operator="state.operator"
        />
        <widget-form-data-table-card-footer :disabled="state.applyDisabled"
                                            :changed="state.optionsChanged"
                                            @delete="handleClickDeleteDataTable"
                                            @reset="handleClickResetDataTable"
                                            @update="handleUpdateDataTable"
        />
        <widget-form-data-table-card-alert-modal :mode="modalState.mode"
                                                 :visible="modalState.visible"
                                                 @cancel="handleCancelModal"
                                                 @confirm="handleConfirmModal"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-contents {
    @apply border border-gray-200 rounded-lg w-full bg-white;
    width: 24rem;
    padding-top: 0.125rem;
    margin-bottom: 2rem;

    &.selected {
        @apply border-violet-600;
        box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        .card-header {
            @apply bg-violet-100 border border-violet-200;
        }
    }

    .card-header {
        @apply bg-gray-100 rounded-lg border border-gray-200;
        width: 23.5rem;
        padding: 0.75rem;
        margin: auto;
    }
}
</style>
