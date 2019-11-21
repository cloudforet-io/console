<template>
    <div ref="editorDom" class="p-monaco" />
</template>

<script>
import * as monaco from 'monaco-editor';
import {
    onMounted, reactive, toRefs,
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
    setup(props, { emit }) {
        const state = reactive({
            editorDom: null, // ref
            editor: null,
        });
        const syncValue = () => {
            emit('update:code', state.editor.getValue());
        };
        onMounted(() => {
            state.editor = monaco.editor.create(state.editorDom, {
                value: props.code,
                theme: props.theme,
                language: props.language,
                readOnly: props.readOnly,
                ...props.createOptions,
            });
            state.editor.onDidChangeModelContent(syncValue);
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="scss" scoped>
.p-monaco{
    width: 100%;
    height: 100%;
}
</style>
