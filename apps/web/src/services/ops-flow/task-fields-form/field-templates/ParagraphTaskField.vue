<script setup lang="ts">
import type { ParagraphTaskField } from '@/schema/opsflow/_types/task-field-type';

import TextEditor from '@/common/components/editor/TextEditor.vue';

import BaseTaskField from '@/services/ops-flow/task-fields-form/field-templates/_base/BaseTaskField.vue';
import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<ParagraphTaskField, string>>();

const emit = defineEmits<{(event: 'update:value', value: string): void;
}>();
const handleUpdate = (value: string, update: (value: string) => void) => {
    update(value);
    emit('update:value', value);
};
</script>

<template>
    <base-task-field v-bind="props">
        <template #default="{ value, invalid, update }">
            <text-editor :value="value"
                         :placeholder="props.field.options?.example"
                         :invalid="invalid"
                         @update:value="handleUpdate($event, update)"
            />
        </template>
    </base-task-field>
</template>
