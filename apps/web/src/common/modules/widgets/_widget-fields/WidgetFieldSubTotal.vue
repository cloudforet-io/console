<script lang="ts" setup>
import { reactive } from 'vue';

import { PFieldTitle, PToggleButton, PCheckbox } from '@spaceone/design-system';

import type { SubTotalOptions, WidgetFieldSchema } from '@/common/modules/widgets/types/widget-config-type';


interface Props {
    widgetFieldSchema: WidgetFieldSchema<SubTotalOptions>;
}

const emit = defineEmits<{(e: 'update:value', value: boolean): void;
}>();

const props = withDefaults(defineProps<Props>(), {
    widgetFieldSchema: () => ({
        label: '',
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
    <div class="widget-field-sub-total">
        <div class="header">
            <p-field-title>{{ props.widgetFieldSchema.label ?? 'Sub Total' }}</p-field-title>
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
.widget-field-sub-total {
    .header {
        @apply flex items-center gap-1;
        margin-bottom: 0.5rem;
    }

    .contents {
        @apply flex gap-2;
    }
}
</style>
