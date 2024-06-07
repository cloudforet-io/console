<script lang="ts" setup>
import { reactive } from 'vue';

import { PFieldTitle, PToggleButton } from '@spaceone/design-system';

import type { LegendOptions, WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<{(e: 'update:value', value: boolean): void;
}>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<LegendOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: false,
        },
    }),
});

const state = reactive({
    value: props.widgetFieldSchema.options?.default ?? false,
});

const handleUpdateValue = (value: boolean) => {
    state.value = value;
    emit('update:value', value);
};
</script>

<template>
    <div class="widget-field-legend">
        <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.LEGEND') }}</p-field-title>
        <p-toggle-button :value="state.value"
                         @update:value="handleUpdateValue"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-legend {
    @apply flex items-center gap-1;
}
</style>
