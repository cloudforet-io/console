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

import { PTextarea } from '@cloudforet/mirinae';

import { createImageExtension } from '@/common/components/editor/extensions/image';
import type { ImageUploader } from '@/common/components/editor/extensions/image/type';
import MenuBar from '@/common/components/editor/MenuBar.vue';
import type { TextEditorContentsType } from '@/common/components/editor/type';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    value?: string;
    imageUploader?: ImageUploader;
    invalid?: boolean;
    placeholder?: string;
    contentsType?: TextEditorContentsType;
    showUndoRedoButtons?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    value: '',
    imageUploader: undefined,
    invalid: false,
    placeholder: '',
    contentsType: 'html',
    showUndoRedoButtons: true,
});
const emit = defineEmits<{(e: 'update:value', value: string): void;
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
    if (props.contentsType === 'html') {
        extensions.push(Color);
        extensions.push(TextAlign.configure({
            types: ['heading', 'paragraph'],
        }));
    }
    if (props.contentsType === 'markdown') {
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
        content: props.value,
        extensions: getExtensions(),
        onUpdate: () => {
            let content = '';
            if (!editor.value) return;
            if (props.contentsType === 'html') {
                content = editor.value?.getHTML() ?? '';
            } else {
                content = editor.value.storage.markdown.getMarkdown() ?? '';
            }
            emit('update:value', content);
        },
    });
});

onBeforeUnmount(() => {
    if (editor.value) editor.value.destroy();
});

watch(() => props.value, (value) => {
    if (!editor.value) return;

    let contents: string;
    if (props.contentsType === 'html') {
        contents = editor.value?.getHTML() ?? '';
    } else {
        contents = editor.value.storage.markdown.getMarkdown() ?? '';
    }
    if (contents === value) return; // prevent infinite loop.

    editor.value.commands.setContent(value, false);
});
</script>

<template>
    <div class="text-editor">
        <p-textarea v-if="props.contentsType === 'plain'"
                    :value="props.value"
                    :placeholder="props.placeholder"
                    :invalid="props.invalid"
                    @update:value="emit('update:value', $event)"
        />
        <div v-else-if="editor"
             class="editor"
             :class="{invalid: props.invalid}"
        >
            <menu-bar :editor="editor"
                      :use-color="props.contentsType === 'html'"
                      :use-text-align="props.contentsType === 'html'"
                      :use-image="!!props.imageUploader"
                      :show-undo-redo-buttons="props.showUndoRedoButtons"
            />
            <editor-content class="editor-content"
                            :editor="editor"
            />
        </div>
    </div>
</template>

<style lang="postcss">
@import './text-editor-nodes.pcss';
.text-editor {
    > .editor .editor-content {
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
    > .editor {
        min-height: inherit;
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
}
</style>
