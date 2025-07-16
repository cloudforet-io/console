<script setup lang="ts">
import { PFieldTitle } from '@cloudforet/mirinae';

import LandingWorkspaceRecentList from '@/services/landing/components/workspace-landing/LandingWorkspaceRecentList.vue';

</script>

<template>
    <div class="landing-recent-visits">
        <p-field-title :label="$t('LADING.RECENT')"
                       color="dark"
                       font-weight="bold"
                       size="md"
        />
        <landing-workspace-recent-list />
    </div>
</template>

<style scoped lang="postcss">
.landing-recent-visits {
    @apply flex-col;
    gap: 1rem;
}
</style>
