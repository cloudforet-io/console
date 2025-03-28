<script setup lang="ts">
import { watch, computed } from 'vue';

import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { ParagraphTaskField } from '@/api-clients/opsflow/_types/task-field-type';

import TextEditor from '@/common/components/editor/TextEditor.vue';
import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';
import { useFileUploader } from '@/common/composables/file-uploader';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';


const props = withDefaults(defineProps<TaskFieldFormProps<ParagraphTaskField, string|undefined>>(), {
    files: () => [],
});

const emit = defineEmits<TaskFieldFormEmits<string|undefined>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

const { fileUploader } = useFileUploader({
    resourceGroup: 'PROJECT',
});
const {
    contents,
    editorContents,
    fileIds,
} = useEditorContentTransformer({
    contents: computed(() => fieldValue.value ?? ''),
    contentsType: 'markdown',
    resourceGroup: 'PROJECT',
    fileIds: props.files.map((f) => f.file_id),
});

watch(contents, updateFieldValue);
watch(fileIds, (ids) => {
    emit('update:file-ids', ids);
});
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
                            :contents="editorContents"
                            show-in-box
                            contents-type="markdown"
        />
        <text-editor v-else
                     class="my-1"
                     :value="editorContents"
                     :image-uploader="fileUploader"
                     :placeholder="props.field.options?.example"
                     :invalid="isInvalid"
                     contents-type="markdown"
                     @update:value="editorContents = $event"
        />
    </p-field-group>
</template>
