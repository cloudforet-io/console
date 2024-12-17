<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import { PFieldGroup, PI, PSelectDropdown } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/src/controls/dropdown/select-dropdown/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import {
    type DATA_TABLE_OPERATOR, JOIN_TYPE,
} from '@/common/modules/widgets/_constants/data-table-constant';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { JoinOptions, JoinType } from '@/common/modules/widgets/types/widget-model';



const props = defineProps<TransformDataTableProps<JoinOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: JoinOptions): void; }>();

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTables: props.originData?.data_tables,
});
const howInfo = ref<JoinOptions['how']>(props.originData.how);
const state = reactive({
    proxyOperatorOptions: useProxyValue<JoinOptions>('operator-options', props, emit),
    joinTypeItems: computed<SelectDropdownMenuItem[]>(() => [
        { label: 'Left Join', name: JOIN_TYPE.LEFT, icon: 'ic_join-left' },
        { label: 'Right Join', name: JOIN_TYPE.RIGHT, icon: 'ic_join-right' },
        { label: 'Outer Join', name: JOIN_TYPE.OUTER, icon: 'ic_join-outer' },
        { label: 'Inner Join', name: JOIN_TYPE.INNER, icon: 'ic_join-inner' },
    ]),
});

/* Event */
const handleUpdateHow = (val: JoinType) => {
    howInfo.value = val;
};

/* Watcher */
watch([dataTableInfo, howInfo], ([_dataTableInfo, _howInfo]) => {
    state.proxyOperatorOptions = {
        data_tables: _dataTableInfo.dataTables || [],
        how: _howInfo,
    };
}, { deep: true, immediate: true });
</script>

<template>
    <div class="widget-form-data-table-card-transform-concatenate">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.CONCAT"
                                                            :data-table-info.sync="dataTableInfo"
        >
            <p-field-group :label="'How'"
                           required
            >
                <p-select-dropdown class="join-type-dropdown"
                                   :menu="state.joinTypeItems"
                                   :selected="howInfo"
                                   block
                                   @update:selected="handleUpdateHow"
                >
                    <template v-if="howInfo"
                              #dropdown-left-area
                    >
                        <p-i class="selected-join-type-icon"
                             :name="state.joinTypeItems.find((item) => item.name === howInfo)?.icon"
                             width="1rem"
                             height="1rem"
                        />
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </widget-form-data-table-card-transform-form-wrapper>
    </div>
</template>
