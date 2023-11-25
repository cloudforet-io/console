<script setup lang="ts">
import { reactive, watch } from 'vue';

import Yaml from 'yaml';

import { PTextEditor } from '@spaceone/design-system';

import CodeEditorToolbox from '@/components/CodeEditorToolbox.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

const props = defineProps<{
    code?: string;
    codeType?: string;
    fullMode?: boolean;
}>();
const emit = defineEmits<{(event: 'update:parsed-object', parsedObject: object): void;
    (event: 'update:code', code: string): void;
    (event: 'update:code-type', codeType: string): void;
    (event: 'expand'): void;
    (event: 'validate', error: Error|null): void;
}>();
const state = reactive({
    code: props.code ?? '',
    codeType: 'Json' as string,
    parsedObject: {} as object,
    parsingError: null as null|Error,
});

const updateCode = (code: string) => {
    state.code = code;
    emit('update:code', state.code);
};
const handleUpdateCodeType = (codeType: string) => {
    emit('update:code-type', codeType);

    if (state.parsingError) {
        handleUpdateCode(state.code);
        return;
    }

    if (props.codeType === 'Json') {
        updateCode(JSON.stringify(state.parsedObject, null, 2));
    } else {
        updateCode(Yaml.stringify(state.parsedObject));
    }
};

const parseCode = (trimmedCode: string) => {
    if (props.codeType === 'Json') return JSON.parse(trimmedCode);
    return Yaml.parse(trimmedCode);
};
const handleUpdateCode = (code?: string) => {
    updateCode(code ?? '');
    const trimmed = code?.trim();
    if (!trimmed) state.parsedObject = {};
    else {
        try {
            const parsed = parseCode(trimmed);
            if (typeof parsed !== 'object') throw new Error(`Parsed object is not an object: ${parsed}`);
            state.parsedObject = parsed;
            state.parsingError = null;
        } catch (e: unknown) {
            state.parsingError = e as Error;
        }
    }
    emit('validate', state.parsingError);
};

const handleClickExpand = () => {
    emit('expand');
};

const handleClickBeautify = () => {
    if (state.parsingError) return;
    if (props.codeType === 'Json') {
        handleUpdateCode(JSON.stringify(state.parsedObject, null, 2));
    } else {
        handleUpdateCode(Yaml.stringify(state.parsedObject));
    }
};

watch(() => state.parsedObject, (parsedObject) => {
    emit('update:parsed-object', parsedObject);
});
watch(() => props.code, (code) => {
    state.code = code ?? '';
});
</script>

<template>
    <div class="code-editor">
        <div class="tools-wrapper">
            <code-editor-toolbox :code-type="props.codeType"
                                 :show-expand-button="!props.fullMode"
                                 @update:code-type="handleUpdateCodeType"
                                 @click-expand="handleClickExpand"
                                 @click-beautify="handleClickBeautify"
            />
        </div>
        <p-text-editor :code="state.code"
                       disable-auto-reformat
                       :style="{
                           'min-height': props.fullMode ? 'auto' : '300px',
                           'max-height': props.fullMode ? 'auto' : '300px',
                       }"
                       @update:code="handleUpdateCode"
        />
        <error-message v-if="!props.fullMode"
                       :error="state.parsingError"
        />
    </div>
</template>

<style scoped lang="postcss">
.code-editor {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .tools-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        .expand-button {
            flex-shrink: 0;
            justify-self: flex-end;
            margin-left: auto;
        }
    }
    .p-text-editor {
        flex-grow: 1;
    }
}
</style>
