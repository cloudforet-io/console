<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PHeading, PTab, PEmpty, PDataLoader,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import type { Currency } from '@/store/display/type';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import CostReportMonthlyTotalAmountSummaryCard
    from '@/services/cost-explorer/components/CostReportMonthlyTotalAmountSummaryCard.vue';
import CostReportOverviewCostTrendCard from '@/services/cost-explorer/components/CostReportOverviewCostTrendCard.vue';
import CostReportRecipientsCard from '@/services/cost-explorer/components/CostReportRecipientsCard.vue';
import CostReportReportsTab from '@/services/cost-explorer/components/CostReportReportsTab.vue';
import CostReportUpcomingReportCard from '@/services/cost-explorer/components/CostReportUpcomingReportCard.vue';
import { useCostReportListQuery } from '@/services/cost-explorer/composables/use-cost-report-list-query';


const { hasReadWriteAccess } = usePageEditableStatus();

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

/* Query */
const { totalCount, isLoading } = useCostReportListQuery({
    thisPage: computed(() => 1),
    pageSize: computed(() => 10),
    params: computed(() => ({
        status: 'DONE',
    })),
});
</script>

<template>
    <div class="cost-report-page">
        <p-heading class="mb-6"
                   :title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.COST_REPORT')"
        />
        <p-tab :tabs="state.tabs"
               :active-tab.sync="state.activeTab"
        >
            <template #overview>
                <p-data-loader :loading="isLoading"
                               :data="true"
                               class="data-loader"
                >
                    <div class="overview-tab-pane">
                        <cost-report-overview-cost-trend-card
                            v-if="totalCount > 0"
                            class="col-span-12"
                        />
                        <cost-report-monthly-total-amount-summary-card
                            v-if="totalCount > 0"
                            class="xl:col-span-8 lg:col-span-6 col-span-12"
                        />
                        <p-empty v-if="!totalCount"
                                 class="xl:col-span-8 lg:col-span-6 col-span-12 empty-card"
                                 show-image
                                 :title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.NO_REPORT')"
                        />
                        <div class="xl:col-span-4 lg:col-span-6 col-span-12 grid gap-4">
                            <cost-report-upcoming-report-card class="col-span-12"
                                                              :has-read-write-access="hasReadWriteAccess"
                            />
                            <cost-report-recipients-card class="col-span-12"
                                                         :has-read-write-access="hasReadWriteAccess"
                            />
                        </div>
                    </div>
                </p-data-loader>
            </template>
            <template #reports>
                <cost-report-reports-tab />
            </template>
        </p-tab>
    </div>
</template>

<style lang="scss" scoped>
.cost-report-page {
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
}

/* custom design-system component - p-tab */
:deep(.p-tab) {
    .data-loader {
        min-height: 14.5rem;
    }
}
</style>
