<script setup lang="ts">
import {
    onBeforeUnmount, onMounted, shallowRef, watch,
} from 'vue';

import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import type { AnyExtension } from '@tiptap/vue-2';
import { Editor, EditorContent } from '@tiptap/vue-2';
import { Markdown } from 'tiptap-markdown';

import { createImageExtension } from '@/common/components/editor/extensions/image';
import { getAttachmentIds, setAttachmentsToContents } from '@/common/components/editor/extensions/image/helper';
import type { Attachment, ImageUploader } from '@/common/components/editor/extensions/image/type';
import MenuBar from '@/common/components/editor/MenuBar.vue';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    value?: string;
    imageUploader?: ImageUploader;
    attachments?: Attachment[];
    invalid?: boolean;
    placeholder?: string;
    contentType?: 'html'|'markdown';
    showUndoRedoButtons?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    value: '',
    imageUploader: undefined,
    attachments: () => [],
    invalid: false,
    placeholder: '',
    contentType: 'html',
    showUndoRedoButtons: true,
});
const emit = defineEmits<{(e: 'update:value', value: string): void;
    (e: 'update:attachment-ids', attachmentIds: string[]): void;
}>();

loadMonospaceFonts();

const editor = shallowRef<null|Editor>(null);

const getExtensions = (): AnyExtension[] => {
    const extensions: AnyExtension[] = [
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
        Placeholder.configure({
            placeholder: props.placeholder,
        }),
        Underline,
        Link,
        TextStyle,
    ];

    // add extensions based on content type
    if (props.contentType === 'html') {
        extensions.push(Color);
        extensions.push(TextAlign.configure({
            types: ['heading', 'paragraph'],
        }));
    }
    if (props.contentType === 'markdown') {
        extensions.push(Markdown);
    }

    // add image extension if imageUploader is provided
    if (props.imageUploader) {
        extensions.push(createImageExtension(props.imageUploader));
    }
    return extensions;
};

onMounted(() => {
    editor.value = new Editor({
        content: setAttachmentsToContents(props.value, props.attachments),
        extensions: getExtensions(),
        onUpdate: () => {
            let content = '';
            if (!editor.value) return;
            if (props.contentType === 'html') {
                content = editor.value?.getHTML() ?? '';
            } else {
                content = editor.value.storage.markdown.getMarkdown() ?? '';
            }
            emit('update:value', content);
            emit('update:attachment-ids', getAttachmentIds(editor.value));
        },
    });
});

onBeforeUnmount(() => {
    if (editor.value) editor.value.destroy();
});

watch([() => props.value, () => props.attachments], ([value, attachments], prev) => {
    if (!editor.value) return;
    let isSame;
    if (props.contentType === 'html') {
        isSame = editor.value.getHTML() === value;
    } else {
        isSame = editor.value.storage.markdown.getMarkdown() === value;
    }
    if (isSame) return;
    let newContents = value;
    if (attachments !== prev[1]) newContents = setAttachmentsToContents(value, attachments);
    editor.value.commands.setContent(newContents, false);
});
</script>

<template>
    <div v-if="editor"
         class="text-editor"
         :class="{invalid: props.invalid}"
    >
        <menu-bar :editor="editor"
                  :use-color="props.contentType === 'html'"
                  :use-text-align="props.contentType === 'html'"
                  :use-image="!!props.imageUploader"
                  :show-undo-redo-buttons="props.showUndoRedoButtons"
        />
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

            /* Placeholder (at the top) */
            p.is-editor-empty:first-child::before {
                @apply text-gray-400;
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
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
    >.suggestion-list {
        @apply absolute;
        z-index: 10;
    }
}
</style>

<style lang="postcss">
.mention {
    @apply bg-violet-150 text-violet-600 rounded-md;
    padding: 0 2px;
}
</style>
