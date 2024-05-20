<script setup lang="ts">
import { PI } from '@spaceone/design-system';

import { violet } from '@/styles/colors';
</script>

<template>
    <span class="bookmark-managed-badge">
        <p-i name="ic_badge-with-ribbon"
             width="0.625rem"
             height="0.625rem"
             :color="violet[700]"
        />
    </span>
</template>

<style scoped lang="postcss">
.bookmark-managed-badge {
    @apply block flex items-center justify-center bg-violet-200 rounded-full;
    width: 0.875rem;
    height: 0.875rem;
}
</style>
