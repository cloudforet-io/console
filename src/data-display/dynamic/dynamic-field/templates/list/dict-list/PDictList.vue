<template>
    <ul class="p-dict-list">
        <li v-for="(value, key, index) in dict" :key="`dict-list-${key}-${index}`">
            <p-tag :deletable="false">
                <span class="key">{{ key }}: </span>
                <span class="value">{{ value }}</span>
            </p-tag>
        </li>
    </ul>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import PTag from '@/data-display/tags/PTag.vue';


export default defineComponent({
    name: 'PDictList',
    components: {
        PTag,
    },
    props: {
        dict: {
            type: Object as PropType<Record<string, string|number>>,
            default: () => ({}),
        },
    },
});
</script>
<style lang="postcss">
.p-dict-list {
    display: inline-grid;
    grid-auto-flow: column;
    .key {
        font-weight: bold;
    }
}
</style>
