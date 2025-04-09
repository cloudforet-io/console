<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PFieldGroup, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    DATA_TABLE_OPERATOR,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { AggregateOptions } from '@/common/modules/widgets/types/widget-model';




const props = defineProps<TransformDataTableProps<AggregateOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: AggregateOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;


/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTableId: props.originData?.data_table_id,
});
const groupByInfo = ref<AggregateOptions['group_by']>(cloneDeep(props.originData.group_by));
const functionInfo = ref<AggregateOptions['function']>(cloneDeep(props.originData.function));

const state = reactive({
    proxyOperatorOptions: useProxyValue<AggregateOptions>('operator-options', props, emit),
    selectedDataTable: computed(() => dataTableList.value.find((dataTable) => dataTable.data_table_id === dataTableInfo.value.dataTableId)),
    invalid: computed<boolean>(() => {
        if (!state.proxyOperatorOptions?.data_table_id) return true;
        if (!state.proxyOperatorOptions.group_by?.length) return true;
        return false;
    }),
    groupByFieldItems: computed<MenuItem[]>(() => {
        if (!state.selectedDataTable) return [];
        const labelsInfo = state.selectedDataTable.labels_info;
        return Object.keys(labelsInfo).map((key) => ({
            name: key,
            label: key,
        }));
    }),
    selectedGroupByItems: computed(() => {
        if (!groupByInfo.value) return [];
        return groupByInfo.value.map((groupBy) => ({
            name: groupBy,
            label: groupBy,
        }));
    }),
});

/* Event */
const handleUpdateSelectedGroupBy = (selected: SelectDropdownMenuItem[]) => {
    const selectedGroupByItems = selected.map((item) => item.name);
    groupByInfo.value = selectedGroupByItems;
};
const handleUpdateSelectGroupBy = (selectedItem: SelectDropdownMenuItem, isSelected: boolean) => {
    if (isSelected && groupByInfo.value.length > 4) {
        groupByInfo.value = groupByInfo.value.filter((groupBy) => groupBy !== selectedItem.name);
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.ALT_E_ADD_GROUP_BY'), '');
    }
};

/* Watcher */
watch([dataTableInfo, groupByInfo, functionInfo], ([_dataTableInfo, _groupByInfo, _functionInfo]) => {
    state.proxyOperatorOptions = {
        data_table_id: _dataTableInfo.dataTableId,
        group_by: _groupByInfo,
        function: _functionInfo,
    };
}, { deep: true, immediate: true });
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });
</script>

<template>
    <div class="widget-form-data-table-card-transform-aggregate">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.AGGREGATE"
                                                            :data-table-info.sync="dataTableInfo"
        >
            <p-field-group :label="$t('COMMON.WIDGETS.DIMENSIONS')"
                           :help-text="$t('COMMON.WIDGETS.DIMENSIONS_DESC')"
                           style-type="secondary"
                           required
                           class="criteria-field"
            >
                <p-select-dropdown :menu="state.groupByFieldItems"
                                   :selected="state.selectedGroupByItems"
                                   multi-selectable
                                   appearance-type="badge"
                                   :page-size="10"
                                   show-select-marker
                                   is-filterable
                                   block
                                   @update:selected="handleUpdateSelectedGroupBy"
                                   @select="handleUpdateSelectGroupBy"
                />
            </p-field-group>
        </widget-form-data-table-card-transform-form-wrapper>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-aggregate {
    /* custom design-system component - p-field-title */
    :deep(.p-field-title) {
        .title {
            @apply flex;
            width: 100%;
        }
    }
}
</style>
