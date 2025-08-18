<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/data-table/WidgetFormDataTableCardTransformFormWrapper.vue';
import {
    DATA_TABLE_OPERATOR,
} from '@/common/modules/widgets/_constants/data-table-constant';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { ConcatOptions } from '@/common/modules/widgets/types/widget-model';



const props = defineProps<TransformDataTableProps<ConcatOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: ConcatOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTables: props.originData?.data_tables,
});
const state = reactive({
    proxyOperatorOptions: useProxyValue<ConcatOptions>('operator-options', props, emit),
    invalid: computed<boolean>(() => {
        if (state.proxyOperatorOptions.data_tables.length < 2) {
            return true;
        }
        return !state.proxyOperatorOptions.data_tables.every((d) => !!d);
    }),
});

// Update operator options
watch(dataTableInfo, (_dataTableInfo) => {
    state.proxyOperatorOptions = {
        data_tables: _dataTableInfo.dataTables || [],
    };
}, { deep: true, immediate: true });
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });
</script>

<template>
    <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                        :operator="DATA_TABLE_OPERATOR.CONCAT"
                                                        :data-table-info.sync="dataTableInfo"
    />
</template>
