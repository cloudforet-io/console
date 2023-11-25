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
    readonly?: boolean;
}>();
const emit = defineEmits<{(event: 'update:parsed-object', parsedObject: object): void;
    (event: 'update:code', code: string): void;
    (event: 'update:code-type', codeType: string): void;
    (event: 'expand'): void;
    (event: 'validate', error: Error|null): void;
}>();
const state = reactive({
    code: props.code ?? '',
    parsedObject: {} as object,
    parsingError: null as null|Error,
});

const updateCode = (code: string) => {
    emit('update:code', code);
};
const updateCodeByCodeType = (codeType: string) => {
    if (state.parsingError) {
        handleUpdateCode(props.code);
        return;
    }

    if (codeType === 'Json') {
        updateCode(JSON.stringify(state.parsedObject, null, 2));
    } else {
        updateCode(Yaml.stringify(state.parsedObject));
    }
};
const handleUpdateCodeType = (codeType: string) => {
    emit('update:code-type', codeType);
    updateCodeByCodeType(codeType);
};

const parseCode = (trimmedCode: string) => {
    if (props.codeType === 'Json') return JSON.parse(trimmedCode);
    let parsed = null as null|object;
    let error = null as null|Error;
    try {
        parsed = Yaml.parse(trimmedCode);
    } catch (e: unknown) {
        error = e as Error;
        try {
            parsed = Yaml.parseAllDocuments(trimmedCode);
            parsed = (parsed as any[]).map((item) => Yaml.stringify(item)).map((str) => Yaml.parse(str));
            error = null;
        } catch (e2: unknown) {
            error = e2 as Error;
        }
    }
    if (error) throw error;
    return parsed;
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
watch(() => props.codeType, (codeType) => {
    updateCodeByCodeType(codeType ?? 'Json');
});
</script>

<template>
    <div class="code-editor">
        <div class="tools-wrapper">
            <code-editor-toolbox :code-type="props.codeType"
                                 :readonly="props.readonly"
                                 :show-expand-button="!props.fullMode"
                                 @update:code-type="handleUpdateCodeType"
                                 @click-expand="handleClickExpand"
                                 @click-beautify="handleClickBeautify"
            />
        </div>
        <p-text-editor :code="props.code"
                       disable-auto-reformat
                       :read-only="props.readonly"
                       :folded="props.readonly"
                       :style="{
                           'min-height': props.fullMode ? 'auto' : '300px',
                           'max-height': props.fullMode ? 'auto' : '300px',
                       }"
                       @update:code="handleUpdateCode"
        />
        <error-message v-if="!props.readonly && !props.fullMode"
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
