<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/WidgetFieldDropdownAndMax.vue';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps, YAxisOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { YAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<YAxisOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<YAxisValue>>();
const state = reactive({
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget ?? 'labels_info';
        if (!props.dataTable) return [];
        const dataInfoList = Object.keys(props.dataTable[dataTarget] ?? {}) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
});

/* Event */
const handleUpdateSelect = (val: YAxisValue) => {
    emit('update:value', val);
};

/* Watcher */
const handleIsValid = (isValid: boolean) => {
    emit('update:is-valid', isValid);
};


</script>

<template>
    <div class="widget-field-y-axis">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.Y_AXIS')"
                       required
        >
            <widget-field-dropdown-and-max :default-count="props.widgetFieldSchema?.options?.defaultMaxCount ?? 1"
                                           :value="props.value"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.Y_AXIS')"
                                           @update:is-valid="handleIsValid"
                                           @update:value="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>
