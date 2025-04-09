<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/WidgetFieldDropdownAndMax.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    CategoryByOptions,
} from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const FIELD_KEY = 'categoryBy';
const props = defineProps<WidgetFieldComponentProps<CategoryByOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget;
        if (!state.selectedDataTable || !dataTarget) return [];
        const dataInfoList = sortWidgetTableFields(Object.keys(state.selectedDataTable?.[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
});

</script>

<template>
    <div class="widget-field-category-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CATEGORY_BY')"
                       required
        >
            <widget-field-dropdown-and-max :field-key="FIELD_KEY"
                                           :field-manager="props.fieldManager"
                                           :default-count="props.widgetFieldSchema?.options?.defaultMaxCount"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CATEGORY_BY')"
                                           :exclude-date-field="props.widgetFieldSchema?.options?.excludeDateField"
            />
        </p-field-group>
    </div>
</template>
