<template>
    <header>
        <span class="title">
            <slot name="default">{{ title }}</slot>
        </span>
        <slot name="extra" />
    </header>
</template>

<script lang="ts">
export default {
    name: 'SidebarTitle',
    props: {
        title: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {
        };
    },
};
</script>

<style lang="postcss" scoped>
header {
    @apply flex pl-4 pt-8 pb-3 mb-3 border-b border-gray-200 items-center;
    .title {
        @apply text-sm text-gray-900 font-semibold capitalize;
        line-height: 1.2;
    }
}
</style>
