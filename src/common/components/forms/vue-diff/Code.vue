<template>
    <div>
        <pre><code class="hljs" v-html="highlightCode" /></pre>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, nextTick, onMounted, ref, watch, PropType,
} from '@vue/composition-api';

import type { VirtualScroll } from './types';
import { setHighlightCode } from './utils';

export default defineComponent({
    name: 'VueDiffCode',
    props: {
        language: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        scrollOptions: {
            type: [Boolean, Object] as PropType<false | VirtualScroll>,
            default: false,
        },
    },
    emits: ['rendered'],
    setup(props, { emit }) {
        const highlightCode = ref('');

        onMounted(() => {
            watch([() => props.language, () => props.code], () => {
                setHighlightCode({
                    highlightCode,
                    language: props.language,
                    code: props.code,
                });
                nextTick(() => emit('rendered'));
            }, { immediate: true });

            watch([() => props.scrollOptions], () => {
                nextTick(() => emit('rendered'));
            }, { deep: true });
        });

        return {
            highlightCode,
        };
    },
});
</script>

<style lang="postcss">
.hljs {
    overflow: visible;
    padding: 0;
    background: transparent;
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
}
</style>
