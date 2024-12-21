<script setup lang="ts">
import type { DropdownTaskFieldOptions, ParagraphTaskFieldOptions } from '@/schema/opsflow/_types/task-field-type';

import TextEditor from '@/common/components/editor/TextEditor.vue';

const props = withDefaults(defineProps<{
    options: ParagraphTaskFieldOptions;
}>(), {
    options: () => ({
        example: '',
    }),
});
const emit = defineEmits<{(event: 'update:options', value: DropdownTaskFieldOptions): void;
    (event: 'update:is-valid', value: boolean): void;
}>();
emit('update:is-valid', true);

</script>

<template>
    <div>
        <text-editor :value="props.options.example"
                     :placeholder="$t('OPSFLOW.FIELD_GENERATOR.ENTER_DEFAULT_DESCRIPTION')"
                     @update:value="emit('update:options', { ...props.options, example: $event })"
        />
    </div>
</template>

<style lang="postcss" scoped>
.text-editor {
    min-height: 224px;
}
</style>
