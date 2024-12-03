<!-- TODO: Edit component file name -->

<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PSelectDropdown, PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataFieldOptions, DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'dataField';
const props = withDefaults(defineProps<_WidgetFieldComponentProps<DataFieldOptions>>(), {
    widgetFieldSchema: () => ({}),
});
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;


const state = reactive({
    fieldValue: computed<DataFieldValue>(() => props.manager.computedData[FIELD_KEY].value),
    multiselectable: computed(() => props.widgetFieldSchema?.options?.multiSelectable),
    menuItems: computed<MenuItem[]>(() => {
        const dataInfoList = Object.keys(widgetGenerateGetters.selectedDataTable?.data_info ?? {}) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    invalid: computed(() => props.manager.getValidationErrors()[FIELD_KEY]),

    selectedItem: computed<MenuItem[]|string|undefined>(() => {
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
    props.manager.setFieldValue(FIELD_KEY, { data: newValue });
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
