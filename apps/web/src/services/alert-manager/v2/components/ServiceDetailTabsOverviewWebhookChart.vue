<script lang="ts" setup>
import ServiceDetailTabsOverviewWebhookBarChartDaily
    from '@/services/alert-manager/v2/components/ServiceDetailTabsOverviewWebhookBarChartDaily.vue';
import ServiceDetailTabsOverviewWebhookBarChartMonthly
    from '@/services/alert-manager/v2/components/ServiceDetailTabsOverviewWebhookBarChartMonthly.vue';

interface Props {
  dateOption: string;
}

const props = withDefaults(defineProps<Props>(), {
    dateOption: 'monthly',
});
</script>

<template>
    <div>
        <service-detail-tabs-overview-webhook-bar-chart-monthly v-if="props.dateOption === 'monthly'" />
        <service-detail-tabs-overview-webhook-bar-chart-daily v-else />
    </div>
</template>
