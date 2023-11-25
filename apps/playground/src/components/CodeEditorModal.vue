<script setup lang="ts">
import { reactive, watch } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import CodeEditor from '@/components/CodeEditor.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

const props = defineProps<{
    visible: boolean;
    title: string;
    code?: string;
    codeType?: string;
}>();
const emit = defineEmits<{(event: 'close'): void;
    (event: 'confirm', code: string, codeType: string, parsedObject: object): void;
}>();

const state = reactive({
    parsedObject: {} as object,
    error: null as null|Error,
    code: props.code ?? '{}',
    codeType: props.codeType ?? 'Json' as string,
});
const handleModalConfirm = () => {
    emit('confirm', state.code, state.codeType, state.parsedObject);
};
const handleValidate = (error: Error|null) => {
    state.error = error;
};
watch(() => props.visible, (visible) => {
    if (visible) {
        state.parsedObject = {};
        state.error = null;
    }
});
</script>

<template>
    <p-button-modal :header-title="props.title"
                    :visible="props.visible"
                    :disabled="!!state.error"
                    @close="emit('close')"
                    @cancel="emit('close')"
                    @confirm="handleModalConfirm"
    >
        <template #body>
            <code-editor :code="props.code"
                         :code-type="props.codeType"
                         full-mode
                         @update:parsed-object="state.parsedObject = $event"
                         @update:code="state.code = $event"
                         @update:code-type="state.codeType = $event"
                         @validate="handleValidate"
            />
        </template>
        <template #footer-extra>
            <error-message :error="state.error" />
        </template>
    </p-button-modal>
</template>


