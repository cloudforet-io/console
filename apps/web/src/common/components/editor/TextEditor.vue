<script setup lang="ts">
import {
    onBeforeUnmount, onMounted, reactive, watch,
} from 'vue';

import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-2';
import { Markdown } from 'tiptap-markdown';

import { createImageExtension } from '@/common/components/editor/extensions/image';
import { getAttachments, setAttachmentsToContents } from '@/common/components/editor/extensions/image/helper';
import type { Attachment, ImageUploader } from '@/common/components/editor/extensions/image/type';
import MenuBar from '@/common/components/editor/MenuBar.vue';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    value?: string;
    imageUploader?: ImageUploader<any>;
    attachments?: Attachment<any>[];
    invalid?: boolean;
    placeholder?: string;
    contentType?: 'html'|'markdown';
}
const props = withDefaults(defineProps<Props>(), {
    value: '',
    imageUploader: () => Promise.resolve<Attachment<any>>({
        downloadUrl: '',
        fileId: '',
    }),
    attachments: () => [],
    invalid: false,
    placeholder: '',
    contentType: 'html',
});
const emit = defineEmits<{(e: 'update:value', value: string): void;
    (e: 'update:attachments', attachments: Attachment<any>[]): void;
}>();

loadMonospaceFonts();

const state = reactive({
    editor: null as null|Editor,
});

const imgFileDataMap = new Map();
onMounted(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
            Markdown,
            Placeholder.configure({
                placeholder: props.placeholder,
            }),
            Underline,
            Link,
            TextStyle,
            Color,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            createImageExtension(props.imageUploader, imgFileDataMap),
        ],
        onUpdate: () => {
            let content = '';
            if (props.contentType === 'html') {
                content = state.editor?.getHTML() ?? '';
            } else {
                content = state.editor?.storage.markdown.getMarkdown() ?? '';
            }
            emit('update:value', content);
            emit('update:attachments', state.editor ? getAttachments<any>(state.editor as Editor, imgFileDataMap) : []);
        },
    });
});

onBeforeUnmount(() => {
    if (state.editor) state.editor.destroy();
});

watch([() => props.value, () => props.attachments], ([value, attachments], prev) => {
    if (!state.editor) return;
    let isSame;
    if (props.contentType === 'html') {
        isSame = state.editor.getHTML() === value;
    } else {
        isSame = state.editor.storage.markdown.getMarkdown() === value;
    }
    if (isSame) return;
    let newContents = value;
    if (attachments !== prev[1]) newContents = setAttachmentsToContents(value, attachments);
    state.editor.commands.setContent(newContents, false);
});
</script>

<template>
    <div v-if="state.editor"
         class="text-editor"
         :class="{invalid: props.invalid}"
    >
        <menu-bar :editor="state.editor" />
        <editor-content class="editor-content"
                        :editor="state.editor"
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
}
</style>
