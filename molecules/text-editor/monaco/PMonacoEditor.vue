<template>
    <div ref="editorDom" class="p-monaco" />
</template>

<script>
import * as monaco from 'monaco-editor';
import {
    onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';


export default {
    name: 'PMonacoEditor',
    props: {
        code: {
            type: String,
            default: '',
        },
        language: {
            type: String,
            default: 'json',
        },
        theme: {
            type: String,
            default: 'vs-dark',
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        createOptions: {
            type: Object,
            default: () => {},
        },
    },
    setup(props, { emit, parent }) {
        const state = reactive({
            editorDom: null, // ref
            editor: null,
            buffer: '',
        });
        const syncValue = () => {
            const value = state.editor.getValue();
            state.buffer = value;
            emit('update:code', state.editor.getValue());
        };
        onMounted(() => {
            state.editor = monaco.editor.create(state.editorDom, {
                value: props.code,
                theme: props.theme,
                language: props.language,
                readOnly: props.readOnly,
                automaticLayout: true,
                ...props.createOptions,
            });
            state.editor.onDidChangeModelContent(syncValue);
            watch(() => props.code, (value) => {
                if (value !== state.buffer) {
                    state.editor.setValue(value);
                }
            }, { immediate: true });
        });
        onUnmounted(() => {
            if (state.editor) {
                state.editor.getModel().dispose();
                state.editor.dispose();
            }
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
