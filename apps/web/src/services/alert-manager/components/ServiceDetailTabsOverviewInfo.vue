<script lang="ts" setup>
import { PPaneLayout } from '@cloudforet/mirinae';

import ServiceDetailTabsOverviewInfoAlertChart
    from '@/services/alert-manager/components/ServiceDetailTabsOverviewInfoAlertChart.vue';
</script>

<template>
    <div class="service-detail-tabs-overview-info">
        <p-pane-layout class="info col-span-1">
            <p class="title-label">
                {{ $t('ALERT_MANAGER.SERVICE.MOST_FREQUENTLY_OCCURRED_ALERTS') }}
            </p>
        </p-pane-layout>
        <p-pane-layout class="info col-span-1">
            <p class="title-label">
                {{ $t('ALERT_MANAGER.SERVICE.LABELS_WITH_THE_MOST_ALERTS') }}
            </p>
            <service-detail-tabs-overview-info-alert-chart />
        </p-pane-layout>
        <p-pane-layout class="info col-span-2">
            <p class="title-label">
                {{ $t('ALERT_MANAGER.WEBHOOK.TITLE') }}
            </p>
        </p-pane-layout>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-info {
    @apply mt-4 grid grid-flow-row-dense grid-cols-2 grid-rows-2 gap-4;
    .info {
        @apply px-4 py-5;
        .title-label {
            @apply text-[1rem] font-bold mb-5;
        }
    }
}
</style>
