<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/WidgetFieldDropdownAndMax.vue';
import type {
    LineByOptions,
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';
import type { LineByValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<LineByOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<LineByValue>>();
const state = reactive({
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
});

/* Event */
const handleUpdateSelect = (val: LineByValue) => {
    emit('update:value', val);
};

/* Watcher */
const handleIsValid = (isValid: boolean) => {
    emit('update:is-valid', isValid);
};


</script>

<template>
    <div class="widget-field-category-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.LINE_BY')"
                       required
        >
            <widget-field-dropdown-and-max :default-count="props.widgetFieldSchema?.options?.defaultMaxCount ?? 1"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.LINE_BY')"
                                           @update:is-valid="handleIsValid"
                                           @update:value="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>
