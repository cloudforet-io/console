<script lang="ts" setup>
import {
    nextTick, onMounted, ref, watch,
} from 'vue';

import type { VirtualScroll } from './types';
import { setHighlightCode } from './utils';

interface Props {
    language: string;
    code: string;
    scrollOptions: false | VirtualScroll;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'rendered'): void}>();

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

</script>

<template>
    <div>
        <!--        eslint-disable-next-line vue/no-v-html-->
        <pre><code class="hljs"
                   v-html="highlightCode"
        /></pre>
    </div>
</template>

<style lang="postcss">
pre code.hljs {
    padding: 0;
}
.hljs {
    @apply text-gray-700;
    overflow: visible;
    padding: 0;
    background: transparent;
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
    font-family: monospace;
}
</style>
