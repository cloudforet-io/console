<script lang="ts" setup>
import { onMounted, reactive } from 'vue';

import { PFieldTitle, PToggleButton, PCheckbox } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { TotalOptions, WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';
import type { TotalValue } from '@/common/modules/widgets/types/widget-field-value-type';


const emit = defineEmits<WidgetFieldComponentEmit<TotalValue|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<TotalOptions, TotalValue>>(), {
    widgetFieldSchema: () => ({
        options: {
            toggle: false,
            default: false,
        },
    }),
});

const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
});

const handleUpdateValue = (value: boolean) => {
    if (!state.proxyValue?.toggleValue) {
        state.proxyValue = undefined;
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            freeze: value,
        };
    }
    emit('update:value', state.proxyValue);
};
const handleUpdateToggle = (value: boolean) => {
    state.proxyValue = {
        toggleValue: value,
        freeze: false,
    };
    if (value) emit('update:value', state.proxyValue);
    else {
        state.proxyValue = undefined;
        emit('update:value', state.proxyValue);
    }
};

onMounted(() => {
    emit('update:is-valid', true);
    if (!props.value) {
        state.proxyValue = undefined;
        return;
    }
    state.proxyValue = {
        toggleValue: props.value.toggleValue ?? props.widgetFieldSchema.options?.toggle ?? false,
        freeze: props.value.freeze ?? props.widgetFieldSchema.options?.default ?? false,
    };
});
</script>

<template>
    <div class="widget-field-total">
        <div class="field-header">
            <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TOTAL') }}</p-field-title>
            <p-toggle-button :value="state.proxyValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.proxyValue?.toggleValue"
             class="contents"
        >
            <p-checkbox :selected="state.proxyValue?.freeze"
                        @change="handleUpdateValue"
            >
                {{ $t('COMMON.WIDGETS.TOTAL.DESC') }}
            </p-checkbox>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-total {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .contents {
        @apply flex gap-2;
        margin-top: 0.5rem;
    }
}
</style>
