<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/WidgetFieldDropdownAndMax.vue';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { StackByOptions } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'stackBy';
const props = defineProps<WidgetFieldComponentProps<StackByOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;

const state = reactive({
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget;
        if (!widgetGenerateGetters.selectedDataTable || !dataTarget) return [];
        const dataInfoList = sortWidgetTableFields(Object.keys(widgetGenerateGetters.selectedDataTable?.[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
});

</script>

<template>
    <div class="widget-field-stack-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.STACK_BY')"
                       required
        >
            <widget-field-dropdown-and-max :field-key="FIELD_KEY"
                                           :field-manager="props.fieldManager"
                                           :default-count="props.widgetFieldSchema?.options?.defaultMaxCount"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.STACK_BY')"
                                           :exclude-date-field="props.widgetFieldSchema?.options?.excludeDateField"
            />
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
