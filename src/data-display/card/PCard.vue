<template>
    <div class="p-card">
        <header>
            <slot name="header">
                {{ header }}
            </slot>
        </header>
        <div class="body">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

interface Props {
    header?: string;
}
export default defineComponent<Props>({
    name: 'PCard',
    props: {
        header: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {};
    },
});
</script>

<style lang="postcss">
.p-card {
    @apply border border-gray-200 rounded-lg;
    header {
        @apply bg-gray-100 text-gray-500 rounded-t-lg border-b border-gray-200;
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
        line-height: 1.5;
    }
    .body {
        padding: 0.75rem 0.875rem;
    }
}
</style>
