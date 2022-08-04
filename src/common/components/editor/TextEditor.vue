<template>
    <div class="text-editor">
        <editor-content class="editor-content" :editor="editor" />
    </div>
</template>

<script lang="ts">
import {
    defineComponent, onBeforeUnmount, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Image from '@tiptap/extension-image';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Editor, EditorContent } from '@tiptap/vue-2';


interface Props {
    value: string
}

export default defineComponent<Props>({
    name: 'TextEditor',
    components: {
        EditorContent,
    },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        value: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            editor: null as null|Editor,
        });

        const addImage = () => {
            if (!state.editor) return;
            const url = window.prompt('URL');

            if (url) {
                state.editor.chain().focus().setImage({ src: url }).run();
            }
        };

        onMounted(() => {
            state.editor = new Editor({
                content: props.value,
                extensions: [
                    Document,
                    Paragraph,
                    Text,
                    Image,
                    Dropcursor,
                ],
                onUpdate: () => { emit('update:value', state.editor?.getHTML() ?? ''); },
            });
        });

        onBeforeUnmount(() => {
            if (state.editor) state.editor.destroy();
        });

        watch(() => props.value, (value) => {
            if (!state.editor) return;
            const isSame = state.editor.getHTML() === value;
            if (isSame) return;
            state.editor.commands.setContent(value, false);
        });

        return {
            ...toRefs(state),
            addImage,
        };
    },
});
</script>

<style lang="postcss" scoped>
.text-editor {
    @apply bg-white border border-gray-200 rounded-lg;
    min-height: 356px;
    .editor-content {
        height: 100%;
        min-height: inherit;
    }
}
</style>
