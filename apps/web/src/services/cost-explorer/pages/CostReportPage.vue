<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PHeading, PTab, PEmpty,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/settings/type';

import CostReportMonthlyTotalAmountSummaryCard
    from '@/services/cost-explorer/components/CostReportMonthlyTotalAmountSummaryCard.vue';
import CostReportOverviewCostTrendCard from '@/services/cost-explorer/components/CostReportOverviewCostTrendCard.vue';
import CostReportRecipientsCard from '@/services/cost-explorer/components/CostReportRecipientsCard.vue';
import CostReportReportsTab from '@/services/cost-explorer/components/CostReportReportsTab.vue';
import CostReportUpcomingReportCard from '@/services/cost-explorer/components/CostReportUpcomingReportCard.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;

const state = reactive({
    tabs: computed<TabItem[]>(() => [
        {
            name: 'overview',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.OVERVIEW'),
            keepAlive: true,
        },
        {
            name: 'reports',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORTS'),
            keepAlive: true,
        },
    ]),
    activeTab: 'overview',
    currency: 'KRW' as Currency,
});

/* Watcher */
watch(() => state.activeTab, (activeTab) => {
    costReportPageState.activeTab = activeTab;
});

onMounted(() => {
    costReportPageStore.fetchCostReportConfig();
    costReportPageStore.fetchRecentReportData();
});
</script>

<template>
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.COST_REPORT')" />
        <p-tab :tabs="state.tabs"
               :active-tab.sync="state.activeTab"
        >
            <template #overview>
                <div v-if="!costReportPageState.recentReportDataLoading"
                     class="overview-tab-pane"
                >
                    <cost-report-overview-cost-trend-card v-if="!costReportPageState.recentReportDataLoading && costReportPageState.hasReport"
                                                          class="col-span-12"
                    />
                    <cost-report-monthly-total-amount-summary-card v-if="!costReportPageState.recentReportDataLoading & costReportPageState.hasReport"
                                                                   class="xl:col-span-8 lg:col-span-6 col-span-12"
                    />
                    <p-empty v-if="!costReportPageState.recentReportDataLoading && !costReportPageState.hasReport"
                             class="xl:col-span-8 lg:col-span-6 col-span-12 empty-card"
                             show-image
                             :title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.NO_REPORT')"
                    />
                    <div class="xl:col-span-4 lg:col-span-6 col-span-12 grid gap-4">
                        <cost-report-upcoming-report-card class="col-span-12" />
                        <cost-report-recipients-card class="col-span-12" />
                    </div>
                </div>
            </template>
            <template #reports>
                <cost-report-reports-tab />
            </template>
        </p-tab>
    </div>
</template>

<style lang="scss" scoped>
.overview-tab-pane {
    @apply grid-cols-12;
    display: grid;
    gap: 1rem;
    align-items: start;
    padding: 1.5rem;
    .cost-report-monthly-total-amount-summary-card {
        @apply col-span-8;
    }
    .empty-card {
        @apply border border-gray-200 rounded-md;
        height: 28.875rem;
    }
    .right-part {
        @apply col-span-4;
        display: grid;
        gap: 1rem;
    }
}
</style>
