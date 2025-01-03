<script setup lang="ts">
import { toRef, ref } from 'vue';

import { isEqual } from 'lodash';

import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { ParagraphTaskField } from '@/schema/opsflow/_types/task-field-type';

import TextEditor from '@/common/components/editor/TextEditor.vue';
import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';
import { useFileAttachments } from '@/common/composables/file-attachments';
import { useFileUploader } from '@/common/composables/file-uploader';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';


const props = withDefaults(defineProps<TaskFieldFormProps<ParagraphTaskField, string>>(), {
    files: () => [],
});

const emit = defineEmits<TaskFieldFormEmits<string>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

const { fileUploader } = useFileUploader();
const { attachments } = useFileAttachments(toRef(props, 'files'));
const handleUpdateAttachmentIds = (attachmentIds: string[]) => {
    const originFileIds = props.files.map((f) => f.file_id);
    if (isEqual(originFileIds, attachmentIds)) return;
    emit('update:file-ids', attachmentIds);
};

const editorContent = ref(fieldValue.value);
const { transformEditorContent } = useEditorContentTransformer();
const handleUpdateEditorContent = (val: string) => {
    editorContent.value = val;
    updateFieldValue(transformEditorContent(val));
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <text-editor-viewer v-if="props.readonly"
                            class="my-1"
                            :contents="fieldValue"
                            :attachments="attachments"
                            show-in-box
                            content-type="markdown"
        />
        <text-editor v-else
                     class="my-1"
                     :value="editorContent"
                     :image-uploader="fileUploader"
                     :attachments="attachments"
                     :placeholder="props.field.options?.example"
                     :invalid="isInvalid"
                     content-type="markdown"
                     @update:value="handleUpdateEditorContent"
                     @update:attachment-ids="handleUpdateAttachmentIds"
        />
    </p-field-group>
</template>
