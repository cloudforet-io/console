<script lang="ts" setup>
import { reactive } from 'vue';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import type {
    MaxOptions,
    WidgetFieldSchema,
} from '@/common/modules/widgets/types/widget-config-type';


interface Props {
    widgetFieldSchema: WidgetFieldSchema<MaxOptions>;
    required: boolean;
}

const emit = defineEmits<{(e: 'update:value', value: number): void;
}>();

const props = withDefaults(defineProps<Props>(), {
    widgetFieldSchema: () => ({
        label: '',
        options: {
            min: 0,
            max: 5,
            default: 0,
        },
    }),
});

const state = reactive({
    value: props.widgetFieldSchema.options?.default ?? props.widgetFieldSchema.options?.min ?? 0,
});

const handleUpdateValue = (value: number) => {
    state.value = value;
    emit('update:value', value);
};
</script>

<template>
    <div class="widget-field-max">
        <p-field-group :label="props.widgetFieldSchema.label">
            <p-text-input type="number"
                          :min="props.widgetFieldSchema.options?.min ?? 0"
                          :max="props.widgetFieldSchema.options?.max ?? 0"
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
</style>
