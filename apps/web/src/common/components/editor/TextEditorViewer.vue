<script lang="ts" setup>
import {
    computed,
} from 'vue';

import { setAttachmentsToContents } from '@/common/components/editor/extensions/image/helper';
import type { Attachment } from '@/common/components/editor/extensions/image/type';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    contents: string,
    attachments: Attachment[]
}

const props = withDefaults(defineProps<Props>(), {
    contents: '',
    attachments: () => [],
});

loadMonospaceFonts();
const refinedContents = computed(() => setAttachmentsToContents(props.contents, props.attachments));

</script>

<template>
    <!--        eslint-disable-next-line vue/no-v-html-->
    <div class="text-editor-contents"
         v-html="refinedContents"
    />
</template>

<style lang="postcss">
@import './text-editor-nodes.pcss';
.text-editor-contents {
    @mixin all-nodes-style;

    img:active {
        outline: none;
    }
}
</style>
