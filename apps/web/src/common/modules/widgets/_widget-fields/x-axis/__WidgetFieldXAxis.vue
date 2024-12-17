<script lang="ts" setup>
import type { Ref } from 'vue';
import {
    computed, reactive, toRef,
} from 'vue';

import { PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/__WidgetFieldDropdownAndMax.vue';
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import {
    useWidgetOptionsComplexValidation,
} from '@/common/modules/widgets/_composables/use-widget-options-complex-validation';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { XAxisValue, XAxisOptions } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';


const props = defineProps<WidgetFieldComponentProps<XAxisOptions, XAxisValue>>();
const emit = defineEmits<WidgetFieldComponentEmit<XAxisValue>>();
const { labelsMenuItem } = useGranularityMenuItem(props, 'xAxis');

const {
    invalid: widgetOptionsInvalid,
} = useWidgetOptionsComplexValidation({
    optionValueMap: toRef(props, 'allValueMap') as Record<string, WidgetFieldValues|undefined>,
    widgetConfig: toRef(props, 'widgetConfig') as Ref<WidgetConfig>,
});

const state = reactive({
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget ?? 'labels_info';
        if (!props.dataTable) return [];
        if (dataTarget === 'labels_info') return labelsMenuItem.value;
        const dataInfoList = sortWidgetTableFields(Object.keys(props.dataTable[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
});

/* Event */
const handleUpdateSelect = (val: XAxisValue) => {
    emit('update:value', val);
};

/* Watcher */
const handleIsValid = (isValid: boolean) => {
    emit('update:is-valid', isValid);
};


</script>

<template>
    <div class="widget-field-x-axis">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.X_AXIS')"
                       required
        >
            <widget-field-dropdown-and-max :default-count="props.widgetFieldSchema?.options?.defaultMaxCount"
                                           :value="props.value"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.X_AXIS')"
                                           :default-index="props.widgetFieldSchema?.options?.defaultIndex"
                                           :exclude-date-field="props.widgetFieldSchema?.options?.excludeDateField"
                                           :common-invalid-state="widgetOptionsInvalid"
                                           @update:is-valid="handleIsValid"
                                           @update:value="handleUpdateSelect"
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
