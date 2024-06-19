<script lang="ts" setup>
import { reactive } from 'vue';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import type { MaxOptions, WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<{(e: 'update:value', value: number): void;
}>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<MaxOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: 0,
        },
    }),
});

const state = reactive({
    value: props.widgetFieldSchema.options?.default ?? props.widgetFieldSchema.options?.min ?? 0,
});

const handleUpdateValue = (value: number|'') => {
    state.value = (value < 0) || (value === '') ? 0 : value;
    emit('update:value', state.value);
};
</script>

<template>
    <div class="widget-field-max">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.MAX')"
                       required
        >
            <p-text-input type="number"
                          :min="0"
                          :value="state.value"
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
