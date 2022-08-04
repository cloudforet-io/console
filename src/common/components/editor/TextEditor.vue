<template>
    <div class="text-editor">
        <menu-bar />
        <editor-content class="editor-content" :editor="editor" />
    </div>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    defineComponent, onBeforeUnmount, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-2';

import { createImageExtension } from '@/common/components/editor/extensions/image';
import type { UploadFn } from '@/common/components/editor/extensions/plugins/drop-image';
import MenuBar from '@/common/components/editor/MenuBar.vue';


interface Props {
    value: string;
    imageUploader: UploadFn;
}

export default defineComponent<Props>({
    name: 'TextEditor',
    components: {
        MenuBar,
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
        imageUploader: {
            type: Function as PropType<UploadFn>,
            default: () => Promise.resolve(''),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            editor: null as null|Editor,
        });

        onMounted(() => {
            state.editor = new Editor({
                content: props.value,
                extensions: [
                    StarterKit.configure({

                    }),
                    createImageExtension(props.imageUploader),
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
        };
    },
});
</script>

<style lang="postcss">
.ProseMirror {
    min-height: inherit;
    &:focus {
        @apply outline-none;
    }
}
</style>
<style lang="postcss" scoped>
.text-editor {
    @apply bg-white border border-gray-200 rounded-lg;
    min-height: 356px;
    > .editor-content {
        min-height: inherit;
    }
    &:focus-within {
        @apply border-secondary;
    }
    p {
        &:focus {
            @apply outline-none;
        }
    }
}
</style>
