<script lang="ts" setup>
import { reactive } from 'vue';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import type {
    WidgetFieldComponentProps,
    MinOptions,
} from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<{(e: 'update:value', value: number): void;
}>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<MinOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: 0,
        },
    }),
});

const state = reactive({
    value: props.widgetFieldSchema.options?.default ?? 0,
});

const handleUpdateValue = (value: number) => {
    state.value = value;
    emit('update:value', state.value);
};
</script>

<template>
    <div class="widget-field-min">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.MIN')"
                       required
        >
            <p-text-input type="number"
                          :value="state.value"
                          @update:value="handleUpdateValue"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-min {
    /* custom design-system component - p-text-input */
    :deep(.p-text-input) {
        width: 100%;
    }
}
</style>
