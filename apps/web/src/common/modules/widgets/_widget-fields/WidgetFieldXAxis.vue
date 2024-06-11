<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/WidgetFieldDropdownAndMax.vue';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps, XAxisOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { XAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<XAxisOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<XAxisValue>>();
const state = reactive({
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
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
            <widget-field-dropdown-and-max :default-count="props.widgetFieldSchema?.options?.defaultMaxCount ?? 1"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.X_AXIS')"
                                           @update:is-valid="handleIsValid"
                                           @update:value="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>
