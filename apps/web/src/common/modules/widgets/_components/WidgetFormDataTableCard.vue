<script setup lang="ts">

import {
    computed, reactive,
} from 'vue';

import WidgetFormDataTableCardAddContents
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAddContents.vue';
import WidgetFormDataTableCardTransformContents
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformContents.vue';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel, DataTableDataType } from '@/common/modules/widgets/types/widget-model';

interface Props {
    item: DataTableModel;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const state = reactive({
    dataTableId: computed<string>(() => props.item.data_table_id),
    dataType: computed<DataTableDataType>(() => props.item.data_type),
    selected: computed<boolean>(() => widgetGenerateState.selectedDataTableId === state.dataTableId),
});

</script>

<template>
    <div class="widget-form-data-table-card">
        <widget-form-data-table-card-add-contents v-if="state.dataType === DATA_TABLE_TYPE.ADDED"
                                                  :item="props.item"
                                                  :selected="state.selected"
        />
        <widget-form-data-table-card-transform-contents v-else-if="state.dataType === DATA_TABLE_TYPE.TRANSFORMED"
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
