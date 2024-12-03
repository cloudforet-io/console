<script setup lang="ts">
import { PDivider } from '@cloudforet/mirinae';

import ServiceDetailTabsOverviewStatusTable
    from '@/services/alert-manager-v2/components/ServiceDetailTabsOverviewStatusTable.vue';

</script>

<template>
    <div class="service-detail-tabs-overview">
        <service-detail-tabs-overview-status-table />
        <p-divider class="divider" />
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview {
    .divider {
        @apply bg-gray-100;
        height: 0.25rem;
    }
}
</style>
