<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
    XAxisOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { XAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<XAxisOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<XAxisValue>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    isValid: computed<boolean>(() => !!state.proxyValue?.value && !!state.proxyValue?.count),
});

/* Event */
const handleUpdateSelect = (val: string) => {
    if (val === state.proxyValue?.value) return;
    state.proxyValue = { ...state.proxyValue, value: val };
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue?.count) return;
    state.proxyValue = { ...state.proxyValue, count: val };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});

/* Init */
onMounted(() => {
    // TODO: set state.proxyValue with the value from the widget or set default value
    state.proxyValue = {
        value: state.menuItems[0]?.name,
        count: props.widgetFieldSchema.options?.default,
    };
});
</script>

<template>
    <div class="widget-field-x-axis">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.X_AXIS')"
                       required
        >
            <div class="field-form-wrapper">
                <p-select-dropdown :menu="state.menuItems"
                                   :selected="state.proxyValue?.value"
                                   @update:selected="handleUpdateSelect"
                />
                <p-text-input type="number"
                              :min="1"
                              :max="props.widgetFieldSchema.options?.max || 100"
                              :value="state.proxyValue?.count"
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
