<script setup lang="ts">
import type { ParagraphTaskFieldOptions } from '@/schema/opsflow/_types/task-field-type';

import TextEditor from '@/common/components/editor/TextEditor.vue';

import type {
    OptionsGeneratorEmit,
    OptionsGeneratorProps,
} from '@/services/ops-flow/task-fields-configuration/types/options-generator-type';

const props = withDefaults(defineProps<OptionsGeneratorProps<ParagraphTaskFieldOptions>>(), {
    options: () => ({
        example: '',
    }),
});
const emit = defineEmits<OptionsGeneratorEmit<ParagraphTaskFieldOptions>>();
emit('update:is-valid', true);

</script>

<template>
    <div>
        <text-editor :value="props.options.example"
                     :placeholder="$t('OPSFLOW.FIELD_GENERATOR.ENTER_DEFAULT_DESCRIPTION')"
                     contents-type="markdown"
                     @update:value="emit('update:options', { ...props.options, example: $event })"
        />
    </div>
</template>

<style lang="postcss" scoped>
.text-editor {
    min-height: 224px;
}
</style>
