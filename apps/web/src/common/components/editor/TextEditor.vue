<script lang="ts" setup>

import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import { watch } from 'vue';

import { createImageExtension } from '@/common/components/editor/extensions/image';
import { getAttachments, setAttachmentsToContents } from '@/common/components/editor/extensions/image/helper';
import type { Attachment, ImageUploader } from '@/common/components/editor/extensions/image/type';
import MenuBar from '@/common/components/editor/MenuBar.vue';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    value: string;
    imageUploader: ImageUploader;
    attachments: Attachment[];
    invalid: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    value: '',
    attachments: () => [],
    invalid: false,
});
const emit = defineEmits(['update:value', 'update:attachments']);

loadMonospaceFonts();

const editor = useEditor({
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
    onUpdate: (update) => {
        emit('update:value', update.editor.getHTML() ?? '');
        emit('update:attachments', update.editor ? getAttachments(update.editor) : []);
    },
});

watch([() => props.value, () => props.attachments], ([value, attachments], prev) => {
    if (!editor.value) return;
    const isSame = editor.value.getHTML() === value;
    if (isSame) return;
    let newContents = value;
    if (attachments !== prev[1]) newContents = setAttachmentsToContents(value, attachments);
    editor.value.commands.setContent(newContents, false);
});

</script>

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
        padding: 0.75rem 1rem 1.125rem;
    }
    &:focus-within {
        @apply border-secondary;
    }
    &.invalid {
        @apply border-alert;
    }
}
</style>
