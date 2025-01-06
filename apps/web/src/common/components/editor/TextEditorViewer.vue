<script setup lang="ts">
import {
    computed, watch, nextTick, ref, toRef,
} from 'vue';

import DOMPurify from 'dompurify';

import { useMarkdown } from '@cloudforet/mirinae';

import type { TextEditorContentType } from '@/common/components/editor/type';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    contents?: string;
    showInBox?: boolean
    contentType?: TextEditorContentType;
}
const props = withDefaults(defineProps<Props>(), {
    contents: '',
    showInBox: false,
    contentType: 'plain',
});

loadMonospaceFonts();

const { sanitizedHtml } = useMarkdown({
    value: toRef(props, 'contents'),
    inlineCodeClass: 'inline-code',
});
const refinedContents = computed(() => {
    if (props.contentType === 'markdown') {
        return sanitizedHtml.value;
    } if (props.contentType === 'html') {
        return DOMPurify.sanitize(props.contents);
    }
    // plain
    return props.contents;
});

const htmlContainer = ref<null|HTMLElement>(null);
const addErrorHandlers = (container: HTMLElement) => {
    container.querySelectorAll('img').forEach((img) => {
        img.onerror = () => {
            img.setAttribute('error', 'true');
        };
    });
};
watch([refinedContents, htmlContainer], async ([, container]) => {
    if (!container) return;
    await nextTick();
    addErrorHandlers(container);
});
</script>

<template>
    <!--        eslint-disable-next-line vue/no-v-html-->
    <div ref="htmlContainer"
         class="text-editor-contents"
         :class="{'contents-box': props.showInBox}"
         v-html="refinedContents"
    />
</template>

<style lang="postcss">
@import './text-editor-nodes.pcss';
.text-editor-contents {
    margin-left: 0.1rem;

    &.contents-box {
        @apply ml-0 p-2 min-h-21 border border-gray-300 rounded-md;
    }

    @mixin all-nodes-style;

    img:active {
        outline: none;
    }

    li {
        @apply ml-1;
    }
}
</style>ㅕ
