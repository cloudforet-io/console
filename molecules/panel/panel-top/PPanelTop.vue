<template>
    <div class="p-panel-top">
        <span class="title">
            <slot />
        </span>
        <span v-if="useTotalCount" class="total-count">
            &nbsp;({{ totalCount }})
        </span>
        <div class="extra">
            <slot name="extra" />
        </div>
    </div>
</template>
<script lang="ts">
export default {
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
    },
};
</script>

<style lang="postcss" scoped>
    .p-panel-top {
        @apply mb-4 mx-4 mt-8;
        display: flex;
        height: 2rem;
        align-items: center;
        .title {
            @apply font-bold text-2xl;
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
