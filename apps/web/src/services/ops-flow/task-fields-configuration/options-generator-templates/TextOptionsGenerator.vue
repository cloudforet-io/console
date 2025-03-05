<script setup lang="ts">
import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { TextTaskFieldOptions } from '@/api-clients/opsflow/_types/task-field-type';

import type {
    OptionsGeneratorEmit,
    OptionsGeneratorProps,
} from '@/services/ops-flow/task-fields-configuration/types/options-generator-type';

const props = withDefaults(defineProps<OptionsGeneratorProps<TextTaskFieldOptions>>(), {
    options: () => ({
        description: '',
    }),
});
const emit = defineEmits<OptionsGeneratorEmit<TextTaskFieldOptions>>();
emit('update:is-valid', true);

</script>

<template>
    <div>
        <p-field-group v-if="props.editable || props.options.description"
                       label="Field Description"
                       :required="!props.editable"
        >
            <p-text-input v-if="props.editable"
                          :value="props.options.description"
                          placeholder="Enter description"
                          @update:value="emit('update:options', { ...props.options, description: $event })"
            />
            <p v-else
               class="text-label-md"
            >
                {{ props.options.description }}
            </p>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.text-editor {
    min-height: 224px;
}
</style>
