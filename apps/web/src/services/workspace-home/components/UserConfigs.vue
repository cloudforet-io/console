<script setup lang="ts">
import UserConfigRecent from '@/services/workspace-home/components/UserConfigRecent.vue';
import UserConfigStarred from '@/services/workspace-home/components/UserConfigStarred.vue';
</script>

<template>
    <div class="user-configs">
        <user-config-recent class="box-wrapper" />
        <user-config-starred class="box-wrapper" />
    </div>
</template>

<style scoped lang="postcss">
.user-configs {
    @apply flex;
    gap: 1rem;
    .box-wrapper {
        @apply border border-gray-200 text-label-md;
        min-height: 15.875rem;
        max-height: 15.875rem;
        border-radius: 0.375rem;
        flex: 1;
    }

    @screen mobile {
        @apply flex-col;
        .box-wrapper {
            min-height: unset;
        }
    }
}
</style>
