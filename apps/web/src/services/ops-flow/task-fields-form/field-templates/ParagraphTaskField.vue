<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { ParagraphTaskField } from '@/schema/opsflow/_types/task-field-type';

import TextEditor from '@/common/components/editor/TextEditor.vue';
import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<ParagraphTaskField, string>>();

const emit = defineEmits<TaskFieldFormEmits<string>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);
</script>

<template>
    <p-field-group :label="field.name"
                   :required="field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <text-editor-viewer v-if="props.readonly"
                            class="my-1"
                            :contents="fieldValue"
                            :attachments="props.attachments"
                            show-in-box
        />
        <text-editor v-else
                     class="my-1"
                     :value="fieldValue"
                     :placeholder="props.field.options?.example"
                     :invalid="isInvalid"
                     @update:value="updateFieldValue"
        />
    </p-field-group>
</template>
