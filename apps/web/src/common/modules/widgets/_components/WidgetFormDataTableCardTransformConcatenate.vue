<script setup lang="ts">
import {
    reactive, ref, watch,
} from 'vue';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import {
    type DATA_TABLE_OPERATOR,
} from '@/common/modules/widgets/_constants/data-table-constant';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { ConcatOptions } from '@/common/modules/widgets/types/widget-model';



const props = defineProps<TransformDataTableProps<ConcatOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: ConcatOptions): void; }>();

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTables: props.originData?.data_tables,
});
const state = reactive({
    proxyOperatorOptions: useProxyValue<ConcatOptions>('operator-options', props, emit),
});

// Update operator options
watch(() => dataTableInfo, (_dataTableInfo) => {
    state.proxyOperatorOptions = {
        data_tables: _dataTableInfo.value.dataTables || [],
    };
}, { deep: true, immediate: true });
</script>

<template>
    <div class="widget-form-data-table-card-transform-concatenate">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.CONCAT"
                                                            :data-table-info.sync="dataTableInfo"
        />
    </div>
</template>
