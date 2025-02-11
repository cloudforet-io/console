<script lang="ts" setup>
import ServiceDetailTabsOverviewWebhookChartDaily
    from '@/services/alert-manager/components/ServiceDetailTabsOverviewWebhookChartDaily.vue';
import ServiceDetailTabsOverviewWebhookChartMonthly
    from '@/services/alert-manager/components/ServiceDetailTabsOverviewWebhookChartMonthly.vue';

interface Props {
  dateOption: string;
}

const props = withDefaults(defineProps<Props>(), {
    dateOption: 'monthly',
});
</script>

<template>
    <div>
        <service-detail-tabs-overview-webhook-chart-monthly v-if="props.dateOption === 'monthly'" />
        <service-detail-tabs-overview-webhook-chart-daily v-else />
    </div>
</template>
