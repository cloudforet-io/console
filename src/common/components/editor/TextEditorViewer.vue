<template>
    <!--        eslint-disable-next-line vue/no-v-html-->
    <div class="text-editor-contents"
         v-html="refinedContents"
    />
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
} from 'vue';

import { setAttachmentsToContents } from '@/common/components/editor/extensions/image/helper';
import type { Attachment } from '@/common/components/editor/extensions/image/type';

import { loadMonospaceFonts } from '@/styles/fonts';

interface Props {
    contents: string,
    attachments: Attachment[]
}

export default defineComponent<Props>({
    name: 'TextEditorViewer',
    components: {},
    props: {
        contents: {
            type: String,
            default: '',
        },
        attachments: {
            type: Array as PropType<Attachment[]>,
            default: () => [],
        },
    },
    setup(props) {
        loadMonospaceFonts();
        const refinedContents = computed(() => setAttachmentsToContents(props.contents, props.attachments));
        return {
            refinedContents,
        };
    },
});
</script>

<style lang="postcss">
@import './text-editor-nodes.pcss';
.text-editor-contents {
    @mixin all-nodes-style;

    img:active {
        outline: none;
    }
}
</style>
