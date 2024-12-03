<script setup lang="ts">
import { PDivider } from '@cloudforet/mirinae';

import ServiceDetailTabsOverviewEscalationPolicy
    from '@/services/alert-manager-v2/components/ServiceDetailTabsOverviewEscalationPolicy.vue';
import ServiceDetailTabsOverviewNotification
    from '@/services/alert-manager-v2/components/ServiceDetailTabsOverviewNotification.vue';
import ServiceDetailTabsOverviewStatusTable
    from '@/services/alert-manager-v2/components/ServiceDetailTabsOverviewStatusTable.vue';
import ServiceDetailTabsOverviewWebhook
    from '@/services/alert-manager-v2/components/ServiceDetailTabsOverviewWebhook.vue';

</script>

<template>
    <div class="service-detail-tabs-overview">
        <service-detail-tabs-overview-status-table />
        <p-divider class="divider" />
        <service-detail-tabs-overview-webhook />
        <p-divider class="divider" />
        <div class="section-wrapper">
            <service-detail-tabs-overview-notification class="section" />
            <p-divider class="divider"
                       vertical
            />
            <service-detail-tabs-overview-escalation-policy class="section" />
        </div>
        <p-divider class="divider" />
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview {
    .divider {
        @apply bg-gray-100;
        height: 0.25rem;
    }
    .section-wrapper {
        @apply flex;
        .divider {
            width: 0.25rem;
            height: unset;
        }
        .section {
            width: calc(50% - 0.125rem);
            height: 17.25rem;
        }
    }
}
</style>
