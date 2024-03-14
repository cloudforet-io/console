<script setup lang="ts">
import { PI } from '@spaceone/design-system';

import { SIDEBAR_STYLE } from '@/common/components/titles/sidebar-title/type';

const props = withDefaults(defineProps<{
    title?: string;
    selected?: boolean;
    styleType?: string;
}>(), {
    title: '',
    selected: false,
    styleType: SIDEBAR_STYLE.DEFAULT,
});
</script>

<template>
    <header :class="{'link': props.styleType === SIDEBAR_STYLE.LINK}">
        <span class="title"
              :class="{'selected': props.selected}"
        >
            <slot name="default">{{ props.title }}</slot>
            <p-i v-if="props.styleType === SIDEBAR_STYLE.LINK"
                 name="ic_chevron-right"
                 width="1rem"
                 height="1rem"
                 color="inherit transparent"
            />
        </span>
        <slot name="extra" />
    </header>
</template>

<style lang="postcss" scoped>
header {
    @apply flex border-t border-gray-200 items-center;
    margin-top: 0.25rem;
    padding: 0.75rem 0 0.5rem 0.5rem;
    .title {
        @apply text-sm text-gray-900 font-semibold capitalize truncate;
        font-size: 0.875rem;
        line-height: 170%;
    }
    &.link {
        padding-top: 0;
        .title {
            &:hover {
                @apply cursor-pointer;
                text-decoration: underline;
            }
            &:active {
                @apply text-blue-600 cursor-pointer;
            }
            &.selected {
                @apply text-blue-600 cursor-pointer;
            }
        }
    }
}
</style>
