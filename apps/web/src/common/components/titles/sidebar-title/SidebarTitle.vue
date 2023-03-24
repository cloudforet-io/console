<template>
    <header :class="{'link': styleType === SIDEBAR_STYLE.LINK}">
        <span class="title"
              :class="{'selected': selected}"
        >
            <slot name="default">{{ title }}</slot>
            <p-i v-if="styleType === SIDEBAR_STYLE.LINK"
                 name="ic_chevron-right"
                 width="1rem"
                 height="1rem"
                 color="inherit transparent"
            />
        </span>
        <slot name="extra" />
    </header>
</template>

<script lang="ts">
import { PI } from '@spaceone/design-system';

import { SIDEBAR_STYLE } from '@/common/components/titles/sidebar-title/type';

export default {
    name: 'SidebarTitle',
    components: {
        PI,
    },
    props: {
        title: {
            type: String,
            default: '',
        },
        selected: {
            type: Boolean,
            default: false,
        },
        styleType: {
            type: String,
            default: SIDEBAR_STYLE.DEFAULT,
        },
    },
    setup() {
        return {
            SIDEBAR_STYLE,
        };
    },
};
</script>

<style lang="postcss" scoped>
header {
    @apply flex border-b border-gray-200 items-center;
    padding: 2rem 0 0.75rem 1rem;
    margin-bottom: 0.75rem;
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
