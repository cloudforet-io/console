<script lang="ts" setup>
import { reactive } from 'vue';

import { PPaneLayout, PSelectButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import ServiceDetailTabsOverviewInfoAlertChart
    from '@/services/alert-manager/components/ServiceDetailTabsOverviewInfoAlertChart.vue';
import ServiceDetailTabsOverviewMostTriggeredAlertsTable
    from '@/services/alert-manager/components/ServiceDetailTabsOverviewMostTriggeredAlertsTable.vue';
import ServiceDetailTabsOverviewWebhook from '@/services/alert-manager/components/ServiceDetailTabsOverviewWebhook.vue';
import ServiceDetailTabsOverviewWebhookChart
    from '@/services/alert-manager/components/ServiceDetailTabsOverviewWebhookChart.vue';

const state = reactive({
    dateOptions: [
        { label: i18n.t('ALERT_MANAGER.SERVICE.WEBHOOK_MONTHLY'), name: 'monthly' },
        { label: i18n.t('ALERT_MANAGER.SERVICE.WEBHOOK_DAILY'), name: 'daily' },
    ],
    selectedDateOption: 'monthly',
});

const handleChangeDateOption = (dateOption: string) => {
    state.selectedDateOption = dateOption;
};
</script>

<template>
    <div class="service-detail-tabs-overview-info">
        <p-pane-layout class="info left col-span-1">
            <service-detail-tabs-overview-most-triggered-alerts-table />
        </p-pane-layout>
        <p-pane-layout class="info col-span-1">
            <p class="title-label">
                {{ $t('ALERT_MANAGER.SERVICE.LABELS_WITH_THE_MOST_ALERTS') }}
            </p>
            <service-detail-tabs-overview-info-alert-chart />
        </p-pane-layout>
        <p-pane-layout class="info col-span-2">
            <div class="flex justify-between">
                <p class="title-label">
                    {{ $t('ALERT_MANAGER.WEBHOOK.TITLE') }}
                </p>
                <div>
                    <p-select-button v-for="(date, i) in state.dateOptions"
                                     :key="i"
                                     class="mr-2"
                                     :value="date.name"
                                     style-type="gray"
                                     :selected="state.selectedDateOption"
                                     @change="handleChangeDateOption"
                    >
                        {{ date.label }}
                    </p-select-button>
                </div>
            </div>
            <service-detail-tabs-overview-webhook-chart :date-option="state.selectedDateOption" />
            <service-detail-tabs-overview-webhook />
        </p-pane-layout>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-info {
    @apply mt-4 grid grid-flow-row-dense grid-cols-2 grid-rows-2 gap-4;
    .info {
        @apply px-4 py-5;
        max-height: 425px;
        overflow: hidden;
        .title-label {
            @apply text-[1rem] font-bold mb-5;
        }
    }
}
</style>
