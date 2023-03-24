<template>
    <div class="list-title">
        <p-i v-if="isPinned"
             class="pin"
             name="ic_pin-filled"
             width="1.125rem"
        />
        <text-highlighting class="title"
                           :term="searchInputText"
                           :text="title"
        />
        <new-mark v-if="isNew"
                  class="new-mark"
        />
    </div>
</template>

<script lang="ts">
import { PI } from '@spaceone/design-system';

import NewMark from '@/common/components/marks/NewMark.vue';
import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';

export default {
    name: 'ListItemTitle',
    components: {
        NewMark,
        TextHighlighting,
        PI,
    },
    props: {
        isPinned: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: '',
        },
        searchInputText: {
            type: String,
            default: '',
        },
    },
};
</script>

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
