<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { LineByOptions } from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetFieldComponentEmit, WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';
import type { LineByValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<LineByOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<LineByValue>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    selectedValue: '',
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    isValid: computed<boolean>(() => !!state.proxyValue.value && !!state.proxyValue.count),
});

/* Event */
const handleUpdateSelect = (val: string) => {
    if (val === state.selectedValue) return;
    state.selectedValue = val;
    state.proxyValue = { ...state.proxyValue, value: val };
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue.count) return;
    state.proxyValue = { ...state.proxyValue, count: val };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});
</script>

<template>
    <div class="widget-field-line-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.LINE_BY')"
                       required
        >
            <div class="field-form-wrapper">
                <p-select-dropdown :menu="state.menuItems"
                                   :selected="state.proxyValue"
                                   @update:selected="handleUpdateSelect"
                />
                <p-text-input type="number"
                              :min="0"
                              @update:value="handleUpdateCount"
                />
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.field-form-wrapper {
    display: flex;
    gap: 0.5rem;
    .p-select-dropdown {
        width: 100%;
    }

    /* custom design-system component - p-text-input */
    :deep(.p-text-input) {
        width: 6.5rem;
        .input-container {
            padding-right: 1.5rem;
        }
    }
}
</style>
