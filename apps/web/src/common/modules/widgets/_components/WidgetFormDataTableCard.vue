<script setup lang="ts">
import {
    computed, reactive, ref,
} from 'vue';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import WidgetFormDataTableCardAddContents
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAddContents.vue';
import WidgetFormDataTableCardTransformContents
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformContents.vue';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableDataType } from '@/common/modules/widgets/types/widget-model';

interface Props {
    item: PublicDataTableModel|PrivateDataTableModel;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const addContents = ref<WidgetFormDataTableCardAddContents|null>(null);
const transformContents = ref<WidgetFormDataTableCardTransformContents|null>(null);

const state = reactive({
    dataTableId: computed<string>(() => props.item.data_table_id),
    dataType: computed<DataTableDataType>(() => props.item.data_type),
    selected: computed<boolean>(() => widgetGenerateState.selectedDataTableId === state.dataTableId),
});

const updateDataTable = async () => {
    if (state.dataType === DATA_TABLE_TYPE.ADDED) {
        await addContents?.value?.updateDataTable();
    } else if (state.dataType === DATA_TABLE_TYPE.TRANSFORMED) {
        await transformContents?.value?.updateDataTable();
    }
};

defineExpose({
    updateDataTable,
});

</script>

<template>
    <div class="widget-form-data-table-card">
        <widget-form-data-table-card-add-contents v-if="state.dataType === DATA_TABLE_TYPE.ADDED"
                                                  ref="addContents"
                                                  :item="props.item"
                                                  :selected="state.selected"
        />
        <widget-form-data-table-card-transform-contents v-else-if="state.dataType === DATA_TABLE_TYPE.TRANSFORMED"
                                                        ref="transformContents"
                                                        :item="props.item"
                                                        :selected="state.selected"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card {
    height: auto;
}
</style>
