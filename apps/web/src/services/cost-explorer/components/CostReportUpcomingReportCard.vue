<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PButton, PSkeleton, PDivider } from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { languages } from '@/store/modules/user/config';

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
    recentIssueDate: computed<Dayjs>(() => {
        const today = dayjs.utc();
        if (Number(today.format('D')) < costReportPageGetters.issueDay) {
            return today.subtract(1, 'month').date(costReportPageGetters.issueDay);
        }
        return today.date(costReportPageGetters.issueDay);
    }),
    recentReportDate: computed<Dayjs>(() => {
        const today = dayjs.utc();
        if (Number(today.format('D')) < costReportPageGetters.issueDay) {
            return today.subtract(2, 'month');
        }
        return today.subtract(1, 'month');
    }),
    upcomingReportDateText: computed(() => {
        const issueDay = costReportPageGetters.issueDay;
        const issueDayText = issueDay < 10 ? `0${issueDay}` : String(issueDay);
        const upcomingIssueDate = state.recentIssueDate.add(1, 'month').format('YYYY-MM');
        return `${upcomingIssueDate}-${issueDayText}`;
    }),
    upcomingReportDateRangeText: computed(() => {
        const upcomingReportDate = state.recentReportDate.add(1, 'month');
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
                <div class="language-currency-wrapper">
                    <span class="label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.LANGUAGE') }}:
                    </span>
                    <span class="text">
                        {{ languages[costReportPageGetters.language] ?? costReportPageGetters.language }}
                    </span>
                    <p-divider class="divider"
                               vertical
                    />
                    <span class="label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.CURRENCY') }}:
                    </span>
                    <span class="text">
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
    padding-bottom: 0.125rem;
}
.date-range-text {
    @apply text-label-md text-gray-500;
}
.language-currency-wrapper {
    @apply text-label-md;
    display: flex;
    gap: 0.25rem;
    align-items: center;
    padding-top: 1rem;
    .label {
        @apply text-gray-600;
        display: none;
    }
    .text {
        font-weight: 500;
    }
    .divider {
        height: 1rem;
        margin: 0 0.25rem;
    }

    @screen lg {
        .label {
            display: inline-block;
        }
    }
}
</style>
