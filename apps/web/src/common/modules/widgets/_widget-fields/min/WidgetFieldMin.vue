<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { MinOptions } from '@/common/modules/widgets/_widget-fields/min/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<number>>();
const props = withDefaults(defineProps<WidgetFieldComponentProps<MinOptions, number>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: 0,
        },
    }),
});

const state = reactive({
    proxyValue: useProxyValue<number>('value', props, emit),
    isValid: computed<boolean>(() => typeof state.proxyValue === 'number'),
});

const handleUpdateValue = (value: string|'') => {
    const parsedValue = value === '' ? 0 : parseInt(value);
    state.proxyValue = (parsedValue < 0) ? 0 : parsedValue;
};

watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = props.value ?? props.widgetFieldSchema.options?.default ?? 0;
});
</script>

<template>
    <div class="widget-field-max">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.MIN')"
                       required
        >
            <p-text-input type="number"
                          :min="0"
                          :value="state.proxyValue"
                          @update:value="handleUpdateValue"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-max {
    /* custom design-system component - p-text-input */
    :deep(.p-text-input) {
        width: 100%;
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
