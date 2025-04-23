<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';


import { PSelectDropdown, PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { SUB_TOTAL_NAME } from '@/common/modules/widgets/_constants/widget-field-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import { widgetValidatorRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type { DataFieldOptions, DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const FIELD_KEY = 'dataField';
const props = withDefaults(defineProps<WidgetFieldComponentProps<DataFieldOptions>>(), {
    widgetFieldSchema: () => ({}),
});
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const validator = widgetValidatorRegistry[FIELD_KEY];

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    isPivotDataTable: computed<boolean>(() => state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT),
    fieldValue: computed<DataFieldValue>(() => props.fieldManager.data[FIELD_KEY]?.value),
    multiselectable: computed(() => props.widgetFieldSchema?.options?.multiSelectable),
    menuItems: computed<MenuItem[]>(() => {
        const dataInfoList = Object.keys(state.selectedDataTable?.data_info ?? {}) ?? [];
        return dataInfoList.filter((field) => field !== SUB_TOTAL_NAME)
            .map((d) => ({
                name: d,
                label: d,
            }));
    }),
    invalid: computed<boolean>(() => !validator(state.fieldValue, props.widgetConfig, state.selectedDataTable)),
    selectedItem: computed<MenuItem[]|string|undefined>(() => {
        if (state.isPivotDataTable) {
            const dataName = state.selectedDataTable?.options.PIVOT?.fields?.column || '';
            return convertToMenuItem([dataName]);
        }
        if (!state.menuItems.length) return undefined;
        if (state.multiselectable) {
            return convertToMenuItem((state.fieldValue.data ?? []) as string[]);
        }
        return (state.fieldValue.data as string) ?? state.menuItems[0]?.name;
    }),
});

/* Event */
const handleChangeValue = (val: string|MenuItem[]) => {
    const newValue = Array.isArray(val) ? val.map((item) => item.name as string) : val;
    props.fieldManager.setFieldValue(FIELD_KEY, { data: newValue });
};

const convertToMenuItem = (data: string[]) => data.map((d) => ({
    name: d,
    label: d,
}));

</script>

<template>
    <div class="widget-field-data-field">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATA_FIELD')"
                       required
        >
            <p-select-dropdown :menu="state.menuItems"
                               :selected="state.selectedItem"
                               :multi-selectable="state.multiselectable"
                               :show-select-marker="state.multiselectable"
                               :invalid="state.invalid"
                               :disabled="state.isPivotDataTable"
                               appearance-type="badge"
                               block
                               @update:selected="handleChangeValue"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
