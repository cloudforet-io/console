<script setup lang="ts">
import { PI, PTextHighlighting } from '@spaceone/design-system';

import NewMark from '@/common/components/marks/NewMark.vue';

const props = withDefaults(defineProps<{
    isPinned?: boolean;
    isNew?: boolean;
    title?: string;
    searchInputText?: string;
}>(), {
    isPinned: false,
    isNew: false,
    title: '',
    searchInputText: '',
});

</script>

<template>
    <div class="list-title">
        <p-i v-if="props.isPinned"
             class="pin"
             name="ic_pin-filled"
             width="1.125rem"
        />
        <p-text-highlighting class="title"
                             :term="props.searchInputText"
                             :text="props.title"
        />
        <new-mark v-if="props.isNew"
                  class="new-mark"
        />
    </div>
</template>

<style scoped lang="postcss">
.list-title {
    vertical-align: baseline;
    .pin {
        margin-right: 0.125rem;
        margin-bottom: 0.1875rem;
    }
    .title {
        @apply text-gray-900 font-bold;
        line-height: 1.25;
    }
    .new-mark {
        display: inline-block;
        margin-top: 0.1875rem;
    }
}

</style>
