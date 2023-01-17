<template>
    <div class="p-panel-top">
        <span class="title">
            <slot>
                {{ title }}
            </slot>
        </span>
        <span v-if="useTotalCount"
              class="total-count"
        >
            &nbsp;({{ commaFormatter(totalCount) }})
        </span>
        <span class="extra">
            <slot name="extra" />
        </span>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

import type { PanelTopProps } from '@/data-display/titles/panel-top/type';
import { commaFormatter } from '@/utils/helpers';

export default defineComponent<PanelTopProps>({
    name: 'PPanelTop',
    props: {
        useTotalCount: {
            type: Boolean,
            default: false,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {
            commaFormatter,
        };
    },
});
</script>

<style lang="postcss">
.p-panel-top {
    @apply mb-4 mx-4 mt-8;
    display: flex;
    height: 2rem;
    align-items: center;
    .title {
        @apply text-2xl;
        line-height: 1.2;
    }
    .total-count {
        @apply text-gray-500 text-lg;
    }
    .extra {
        @apply pl-4;
        flex-grow: 1;
    }
}
</style>
