<script setup lang="ts">
import {
    onBeforeUnmount, onMounted, reactive, watch,
} from 'vue';

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
    value?: string;
    imageUploader?: ImageUploader;
    attachments?: Attachment[];
    invalid?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    value: '',
    imageUploader: () => Promise.resolve<Attachment>({
        downloadUrl: '',
        fileId: '',
    }),
    attachments: () => [],
    invalid: false,
});
const emit = defineEmits<{(e: 'update:value', value: string): void;
    (e: 'update:attachments', attachments: Attachment[]): void;
}>();

loadMonospaceFonts();

const state = reactive({
    editor: null as null|Editor,
});

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
