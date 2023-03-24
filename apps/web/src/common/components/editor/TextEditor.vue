<template>
    <div v-if="editor"
         class="text-editor"
         :class="{invalid: invalid}"
    >
        <menu-bar :editor="editor" />
        <editor-content class="editor-content"
                        :editor="editor"
        />
    </div>
</template>

<script lang="ts">

import {
    defineComponent, onBeforeUnmount, onMounted, reactive, toRefs, watch,
} from 'vue';
import type { PropType, SetupContext } from 'vue';

import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-2';

import { createImageExtension } from '@/common/components/editor/extensions/image';
import { getAttachments, setAttachmentsToContents } from '@/common/components/editor/extensions/image/helper';
import type { Attachment, ImageUploader } from '@/common/components/editor/extensions/image/type';
import MenuBar from '@/common/components/editor/MenuBar.vue';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    value: string;
    imageUploader: ImageUploader;
    attachments: Attachment[];
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
            type: Function as PropType<ImageUploader>,
            default: () => Promise.resolve(''),
        },
        attachments: {
            type: Array as PropType<Attachment[]>,
            default: () => [],
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        loadMonospaceFonts();

        const state = reactive({
            editor: null as null|Editor,
        });

        onMounted(() => {
            state.editor = new Editor({
                content: setAttachmentsToContents(props.value, props.attachments),
                extensions: [
                    StarterKit.configure({
                        heading: {
                            levels: [1, 2, 3],
                        },
                        code: {
                            HTMLAttributes: {
                                class: 'inline-code',
                            },
                        },
                    }),
                    Underline,
                    Link,
                    TextStyle,
                    Color,
                    TextAlign.configure({
                        types: ['heading', 'paragraph'],
                    }),
                    createImageExtension(props.imageUploader),
                ],
                onUpdate: () => {
                    emit('update:value', state.editor?.getHTML() ?? '');
                    emit('update:attachments', state.editor ? getAttachments(state.editor as Editor) : []);
                },
            });
        });

        onBeforeUnmount(() => {
            if (state.editor) state.editor.destroy();
        });

        watch([() => props.value, () => props.attachments], ([value, attachments], prev) => {
            if (!state.editor) return;
            const isSame = state.editor.getHTML() === value;
            if (isSame) return;
            let newContents = value;
            if (attachments !== prev[1]) newContents = setAttachmentsToContents(value, attachments);
            state.editor.commands.setContent(newContents, false);
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
@import './text-editor-nodes.pcss';
.text-editor {
    > .editor-content {
        .ProseMirror {
            @mixin all-nodes-style;
            min-height: inherit;
            &:focus {
                @apply outline-none;
            }
        }
    }
}
</style>
<style lang="postcss" scoped>
.text-editor {
    @apply bg-white border border-gray-200 rounded-lg;
    min-height: 356px;
    > .editor-content {
        min-height: inherit;
        padding: 0.75rem 1rem 1.125rem 1rem;
    }
    &:focus-within {
        @apply border-secondary;
    }
    &.invalid {
        @apply border-alert;
    }
}
</style>
