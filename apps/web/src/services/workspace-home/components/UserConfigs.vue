<script setup lang="ts">
import { PFieldTitle } from '@spaceone/design-system';

import UserConfigRecent from '@/services/workspace-home/components/UserConfigRecent.vue';
</script>

<template>
    <div class="user-configs">
        <user-config-recent class="box-wrapper" />
        <div class="box-wrapper starred">
            <p-field-title :label="$t('HOME.CONFIG_STARRED_TITLE')" />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-configs {
    @apply flex;
    gap: 1rem;
    .box-wrapper {
        @apply border border-gray-200 text-label-md ;
        padding: 1rem;
        border-radius: 0.375rem;
        flex: 1;
    }
}
</style>
