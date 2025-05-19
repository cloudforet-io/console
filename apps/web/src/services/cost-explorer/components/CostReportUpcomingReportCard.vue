<script lang="ts" setup>
import { computed } from 'vue';

import { useMutation } from '@tanstack/vue-query';
import dayjs from 'dayjs';

import {
    PSkeleton, PDivider, PTooltip, PButton, PI,
} from '@cloudforet/mirinae';

import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import { i18n } from '@/translations';

import { languages } from '@/store/user/constant';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/queries/use-cost-report-config-query';
import { getUpcomingIssueDate, getUpcomingConfirmationDate } from '@/services/cost-explorer/helpers/cost-report-issue-date-helper';

const { costReportConfig, isLoading: isCostReportConfigLoading } = useCostReportConfigQuery();
const { costReportConfigAPI } = useCostReportConfigApi();

const issueDate = computed<number|undefined>(() => costReportConfig.value?.issue_day);
const lastDayOfMonth = computed<boolean>(() => costReportConfig.value?.is_last_day || false);
const enableAdjustments = computed<boolean>(() => costReportConfig.value?.adjustment_options?.enabled || false);
const manualAdjustablePeriod = computed<number|undefined>(() => costReportConfig.value?.adjustment_options?.period);
const upcomingReportDate = computed<string>(() => getUpcomingIssueDate(lastDayOfMonth.value, issueDate.value));
const confirmationDate = computed<string>(() => getUpcomingConfirmationDate(enableAdjustments.value, upcomingReportDate.value, manualAdjustablePeriod.value ?? 0));
const reportDateRange = computed<string>(() => {
    if (!costReportConfig.value) return '';
    let recentReportDate = dayjs.utc();
    const today = dayjs.utc();
    if (Number(today.format('D')) < costReportConfig.value?.issue_day) {
        recentReportDate = today.subtract(1, 'month');
    } else {
        recentReportDate = today;
    }
    const startOfNextMonth = recentReportDate.startOf('month');
    const endOfNextMonth = recentReportDate.endOf('month');
    return `${startOfNextMonth.format('YYYY-MM-DD')} ~ ${endOfNextMonth.format('YYYY-MM-DD')}`;
});

const { mutateAsync: reissueReport, isPending: reissueReportLoading } = useMutation({
    mutationFn: costReportConfigAPI.run,
    onSuccess: () => {
        showSuccessMessage(i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_S_REISSUE_REPORT'), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_E_REISSUE_REPORT'));
    },
});
const handleReissueReport = async () => {
    if (!costReportConfig.value?.cost_report_config_id) return;
    await reissueReport({
        cost_report_config_id: costReportConfig.value?.cost_report_config_id,
    });
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
            <p-button
                style-type="secondary"
                size="sm"
                icon-left="ic_renew"
                :disabled="!costReportConfig?.cost_report_config_id"
                :loading="reissueReportLoading"
                @click="handleReissueReport"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.REISSUE_REPORT') }}
            </p-button>
        </template>
        <template #content>
            <p-skeleton v-if="isCostReportConfigLoading"
                        width="8rem"
                        height="1.875rem"
            />
            <template v-else>
                <div class="upcoming-report-date-wrapper">
                    <div class="date-row">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.ISSUE_DATE') }}</span>
                        <span class="value">{{ upcomingReportDate }}</span>
                    </div>
                    <div class="date-row">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.CONFIRMATION_DATE') }}</span>
                        <span class="value">
                            <span class="date">{{ confirmationDate }}</span>
                            <p-tooltip
                                :contents="$t('BILLING.COST_MANAGEMENT.COST_REPORT.UPCOMING_REPORT_CONFIRMATION_DATE_TOOLTIP')"
                                position="bottom"
                            >
                                <p-i name="ic_info-circle"
                                     height="0.75rem"
                                     width="0.75rem"
                                     color="inherit"
                                />
                            </p-tooltip>
                        </span>
                    </div>
                </div>
                <p class="date-range-text">
                    {{ reportDateRange }}
                </p>
                <p-divider />
                <div class="language-currency-wrapper">
                    <span class="label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.LANGUAGE') }}:
                    </span>
                    <span class="text">
                        {{ languages[costReportConfig?.language ?? 'en'] ?? costReportConfig?.language }}
                    </span>
                    <p-divider class="divider"
                               vertical
                    />
                    <span class="label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.CURRENCY') }}:
                    </span>
                    <span class="text">
                        {{ costReportConfig?.currency }}
                    </span>
                </div>
            </template>
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="scss" scoped>
.upcoming-report-date-wrapper {
    @apply bg-gray-100 rounded-md p-4 text-label-md;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
    .date-row {
        display: grid;
        grid-template-columns: 10rem 1fr;
        align-items: center;
        .label {
            @apply text-gray-700;
        }
        .value {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            .date {
                @apply text-gray-800;
                font-weight: 700;
            }
        }
    }
}
.date-text {
    @apply text-display-sm;
    padding-bottom: 0.125rem;
}
.date-range-text {
    @apply text-label-md text-gray-500;
    padding-bottom: 1rem;
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
