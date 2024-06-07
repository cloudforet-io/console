<script lang="ts" setup>
import { reactive } from 'vue';

import { PFieldTitle, PToggleButton, PCheckbox } from '@spaceone/design-system';

import type { TotalOptions, WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<{(e: 'update:value', value: boolean): void;
}>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<TotalOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            toggle: false,
            default: false,
        },
    }),
});

const state = reactive({
    toggleValue: props.widgetFieldSchema.options?.toggle ?? false,
    value: props.widgetFieldSchema.options?.default ?? false,
});

const handleUpdateValue = (value: boolean) => {
    state.value = value;
    emit('update:value', value);
};
const handleUpdateToggle = (value: boolean) => {
    state.toggleValue = value;
    if (value) emit('update:value', state.value);
    else {
        state.value = false;
        emit('update:value', false);
    }
};
</script>

<template>
    <div class="widget-field-total">
        <div class="header">
            <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TOTAL') }}</p-field-title>
            <p-toggle-button :value="state.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.toggleValue"
             class="contents"
        >
            <p-checkbox :selected="state.value"
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
        @apply flex items-center gap-1;
        margin-bottom: 0.5rem;
    }

    .contents {
        @apply flex gap-2;
    }
}
</style>
