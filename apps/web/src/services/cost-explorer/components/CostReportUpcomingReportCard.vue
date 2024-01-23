<script lang="ts" setup>
import { reactive } from 'vue';

import { PButton } from '@spaceone/design-system';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import CostReportSettingsModal from '@/services/cost-explorer/components/CostReportSettingsModal.vue';


const state = reactive({
    settingsModalVisible: false,
});

/* Event */
const handleClickSettings = (): void => {
    state.settingsModalVisible = true;
};
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.UPCOMING_REPORT') }}
            </span>
        </template>
        <template #right-extra>
            <p-button style-type="tertiary"
                      icon-left="ic_settings"
                      size="sm"
                      @click="handleClickSettings"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SETTINGS') }}
            </p-button>
        </template>
        <template #content>
            <p class="date-text">
                2023-08-10
            </p>
            <p class="date-range-text">
                2023-07-01 ~ 2023-07-31
            </p>
            <div class="currency-wrapper">
                <span class="currency-label">
                    {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.CURRENCY') }}:
                </span>
                <span class="currency-text">
                    KRW
                </span>
            </div>
            <cost-report-settings-modal :visible.sync="state.settingsModalVisible" />
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="scss" scoped>
.top-part {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
        @apply text-label-lg font-bold;
    }
}
.date-text {
    @apply text-display-sm;
    padding-bottom: 0.25rem;
}
.date-range-text {
    @apply text-label-md;
}
.currency-wrapper {
    @apply text-label-md;
    padding-top: 1rem;
    .currency-label {
        @apply text-gray-600;
    }
    .currency-text {
        font-weight: 500;
    }
}
</style>
