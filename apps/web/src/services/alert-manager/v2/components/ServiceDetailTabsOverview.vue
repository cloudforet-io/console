<script setup lang="ts">
import ServiceDetailTabsOverviewStatusTable from '@/services/alert-manager/v2/components/ServiceDetailTabsOverviewStatusTable.vue';
</script>

<template>
    <div class="service-detail-tabs-overview">
        <service-detail-tabs-overview-status-table />
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
            height: 15.25rem;
        }

        @screen tablet {
            flex-direction: column;
            .divider {
                width: unset;
                height: 0.25rem;
            }
            .section {
                width: 100%;
            }
        }
    }
}
</style>
