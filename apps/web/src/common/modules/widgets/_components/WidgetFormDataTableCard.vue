<script setup lang="ts">
import {
    computed, reactive, ref,
} from 'vue';

import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';

import WidgetFormDataTableCardAddContents
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAddContents.vue';
import WidgetFormDataTableCardLoadingContents
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardLoadingContents.vue';
import WidgetFormDataTableCardTransformContents
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformContents.vue';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableDataType } from '@/common/modules/widgets/types/widget-model';

const LOADING_STATE = 'LOADING';
interface Props {
    item?: PublicDataTableModel|PrivateDataTableModel;
    loadingCard?: boolean;
    loading?: boolean;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const addContents = ref<typeof WidgetFormDataTableCardAddContents|null>(null);
const transformContents = ref<typeof WidgetFormDataTableCardTransformContents|null>(null);

const state = reactive({
    dataTableId: computed<string|undefined>(() => props.item?.data_table_id),
    dataType: computed<DataTableDataType | 'LOADING' | undefined>(() => (props.loadingCard ? LOADING_STATE : props.item?.data_type)),
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
        <widget-form-data-table-card-loading-contents v-if="!props.item || props.loadingCard" />
        <widget-form-data-table-card-add-contents v-if="state.dataType === DATA_TABLE_TYPE.ADDED"
                                                  ref="addContents"
                                                  :item="props.item"
                                                  :selected="state.selected"
                                                  :loading="props.loading"
        />
        <widget-form-data-table-card-transform-contents v-else-if="state.dataType === DATA_TABLE_TYPE.TRANSFORMED"
                                                        ref="transformContents"
                                                        :item="props.item"
                                                        :selected="state.selected"
                                                        :loading="props.loading"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card {
    height: auto;
}
</style>
