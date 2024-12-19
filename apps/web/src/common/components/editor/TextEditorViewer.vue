<script setup lang="ts">
import { computed, toRef } from 'vue';

import { useMarkdown } from '@cloudforet/mirinae';

import { setAttachmentsToContents } from '@/common/components/editor/extensions/image/helper';
import type { Attachment } from '@/common/components/editor/extensions/image/type';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    contents?: string;
    attachments?: Attachment[];
    showInBox?: boolean
    contentType?: 'html'|'markdown';
}
const props = withDefaults(defineProps<Props>(), {
    contents: '',
    attachments: () => [],
    showInBox: false,
    contentType: 'html',
});

loadMonospaceFonts();
const { markdown } = useMarkdown(toRef(props, 'contents'));
const refinedContents = computed(() => {
    if (props.contentType === 'markdown') {
        return markdown.value;
    }
    return setAttachmentsToContents(props.contents, props.attachments);
});
</script>

<template>
    <!--        eslint-disable-next-line vue/no-v-html-->
    <div class="text-editor-contents"
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
