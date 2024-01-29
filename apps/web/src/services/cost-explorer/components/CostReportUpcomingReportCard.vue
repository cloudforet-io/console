<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PButton, PSkeleton } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import CostReportSettingsModal from '@/services/cost-explorer/components/CostReportSettingsModal.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const costReportPageState = costReportPageStore.state;
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    settingsModalVisible: false,
    upcomingReportDateText: computed(() => {
        const issueDay = costReportPageGetters.issueDay;
        const issueDayText = issueDay < 10 ? `0${issueDay}` : String(issueDay);
        const upcomingIssueDate = dayjs.utc(costReportPageGetters.recentIssueDate).add(1, 'month').format('YYYY-MM');
        return `${upcomingIssueDate}-${issueDayText}`;
    }),
    upcomingReportDateRangeText: computed(() => {
        const upcomingReportDate = dayjs.utc(costReportPageGetters.recentReportDate).add(1, 'month');
        const startOfNextMonth = upcomingReportDate.startOf('month');
        const endOfNextMonth = upcomingReportDate.endOf('month');
        return `${startOfNextMonth.format('YYYY-MM-DD')} ~ ${endOfNextMonth.format('YYYY-MM-DD')}`;
    }),
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
        <template v-if="storeState.isAdminMode"
                  #right-extra
        >
            <p-button style-type="tertiary"
                      icon-left="ic_settings"
                      size="sm"
                      @click="handleClickSettings"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SETTINGS') }}
            </p-button>
        </template>
        <template #content>
            <p-skeleton v-if="costReportPageState.reportConfigLoading"
                        width="8rem"
                        height="1.875rem"
            />
            <template v-else>
                <p class="date-text">
                    {{ state.upcomingReportDateText }}
                </p>
                <p class="date-range-text">
                    {{ state.upcomingReportDateRangeText }}
                </p>
                <div class="currency-wrapper">
                    <span class="currency-label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.CURRENCY') }}:
                    </span>
                    <span class="currency-text">
                        {{ costReportPageGetters.currency }}
                    </span>
                </div>
            </template>
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
    padding-bottom: 0.38rem;
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
