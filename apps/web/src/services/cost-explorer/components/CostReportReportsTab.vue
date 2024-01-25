<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PButton, PHeading, PLink, PToolboxTable, PSelectDropdown, PBadge,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { CostReportGetUrlParameters } from '@/schema/cost-analysis/cost-report/api-verbs/get-url';
import type { CostReportDataLinkInfoModel } from '@/schema/cost-analysis/cost-report/model';
import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { copyAnyData } from '@/lib/helper/copy-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import CustomDateModal from '@/common/components/custom-date-modal/CustomDateModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import CostReportResendModal from '@/services/cost-explorer/components/CostReportResendModal.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
import type { Field } from '@/services/dashboards/widgets/_types/widget-data-table-type';

const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;

const state = reactive({
    loading: {
        copy: false,
        send: false,
        item: false,
    },
    tags: [],
    currency: computed(() => costReportPageState.costReportConfig?.currency || 'KRW' as Currency),
    periodMenuItems: computed<MenuItem[]>(() => {
        const thisMonth = dayjs.utc();
        const last12Months = Array.from({ length: 12 }, (_, i) => thisMonth.subtract(i, 'month')).reverse();
        return [
            { name: 'all', label: 'All' },
            ...last12Months.map((month) => ({ name: month.format('YYYY-MM'), label: month.format('MMMM YYYY') })),
            { type: 'divider' },
            { name: 'custom', label: 'Custom' },
        ];
    }),
    originalSelectedPeriod: 'all',
    selectedPeriod: 'all',
    customPeriod: undefined as { start?: string; end?: string }|undefined,
    customPeriodModalVisible: false,
    resendModalVisible: false,
});
const tableFields: Field[] = [
    { label: 'Issue Date', name: 'issue_date' },
    { label: 'Report Number', name: 'cost_report_number' },
    { label: 'Workspace', name: 'workspace_name' },
    { label: 'Cost', name: 'cost' },
    { label: ' ', name: 'extra' },
];

/* Util */
const getDateRangeText = (date: string): string => {
    const _date = dayjs.utc(date).subtract(1, 'month');
    return `${_date.startOf('month').format('YYYY-MM-DD')} ~ ${_date.endOf('month').format('YYYY-MM-DD')}`;
};
const getCustomPeriodText = (start?: string, end?: string): string => {
    if (!start || !end) return '';
    const startDate = dayjs.utc(start);
    const endDate = dayjs.utc(end);
    return `${startDate.format('MMM YYYY')} ~ ${endDate.format('MMM YYYY')}`;
};

/* Event */
const handleSelectPeriodMenuItem = (selectedPeriod: string): void => {
    if (selectedPeriod === 'custom') {
        state.customPeriodModalVisible = true;
    } else {
        state.selectedPeriod = selectedPeriod;
        state.customPeriod = undefined;
    }
};
const handleConfirmCustomPeriod = (start: string, end: string): void => {
    state.selectedPeriod = 'custom';
    state.customPeriod = { start, end };
};
const handleClickCopyButton = () => {
    fetchCostReportsUrl();
};
const handleClickResendButton = async (id: string): Promise<void> => {
    state.loading.item = true;
    try {
        await costReportPageStore.fetchCostReport({
            cost_report_id: id,
        });
        state.resendModalVisible = true;
    } finally {
        state.loading.item = false;
    }
};

/* API */
const fetchCostReportsUrl = async (): Promise<void> => {
    state.loading.copy = true;
    try {
        const res = await SpaceConnector.clientV2.costAnalysis.costReport.getUrl<CostReportGetUrlParameters, CostReportDataLinkInfoModel>();
        copyAnyData(res.cost_report_data_link);
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_COPY_REPORT_URL'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading.copy = false;
    }
};

/* Init */
onMounted(() => {
    costReportPageStore.fetchCostReportsList();
});
</script>

<template>
    <div>
        <p-toolbox-table class="cost-report-reports-tab"
                         search-type="query"
                         :multi-select="false"
                         :loading="costReportPageState.reportListLoading"
                         :total-count="costReportPageState.reportListTotalCount"
                         :items="costReportPageState.reportListItems"
                         :fields="tableFields"
                         :query-tags="state.tags"
        >
            <template #toolbox-top>
                <p-heading heading-type="sub"
                           use-total-count
                           :total-count="costReportPageState.reportListTotalCount"
                           :title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORTS')"
                >
                    <template #title-right-extra>
                        <div class="heading-right-part">
                            <p-badge v-if="state.customPeriod"
                                     badge-type="subtle"
                                     style-type="gray200"
                            >
                                {{ getCustomPeriodText(state.customPeriod?.start, state.customPeriod?.end) }}
                            </p-badge>
                            <p-select-dropdown
                                :menu="state.periodMenuItems"
                                :selected="state.selectedPeriod"
                                reset-selection-on-menu-close
                                selection-label="Period"
                                style-type="rounded"
                                class="period-select-dropdown"
                                @select="handleSelectPeriodMenuItem"
                            />
                        </div>
                    </template>
                </p-heading>
            </template>
            <template #col-issue_date-format="{value}">
                <div class="date-text">
                    {{ value }}
                </div>
                <div class="date-range-text">
                    {{ getDateRangeText(value) }}
                </div>
            </template>
            <template #col-cost_report_number-format="{value}">
                <!-- TODO: check href link-->
                <p-link :text="value"
                        href="/"
                        highlight
                        action-icon="external-link"
                />
            </template>
            <template #col-cost-format="{value}">
                <span class="currency-symbol">{{ CURRENCY_SYMBOL[state.currency] }}</span>
                <span class="text">{{ numberFormatter(value[state.currency]) }}</span>
                <span class="currency-text">{{ state.currency }}</span>
            </template>
            <template #col-extra-format="{item}">
                <div class="float-right">
                    <p-button style-type="tertiary"
                              icon-left="ic_link"
                              size="sm"
                              class="copy-button"
                              :loading="state.loading.copy"
                              @click="handleClickCopyButton"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COPY') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              icon-left="ic_paper-airplane"
                              size="sm"
                              class="resend-button"
                              :loading="state.loading.item"
                              @click="handleClickResendButton(item.cost_report_id)"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.RESEND') }}
                    </p-button>
                </div>
            </template>
        </p-toolbox-table>
        <custom-date-modal :visible.sync="state.customPeriodModalVisible"
                           hide-help-text
                           :start="state.customPeriod?.start"
                           :end="state.customPeriod?.end"
                           @confirm="handleConfirmCustomPeriod"
        />
        <cost-report-resend-modal :visible.sync="state.resendModalVisible" />
    </div>
</template>

<style lang="postcss" scoped>
.cost-report-reports-tab {
    border: none;
}
.period-select-dropdown {
    float: right;
}
.heading-right-part {
    display: inline-flex;
    align-items: center;
    float: right;
    gap: 0.5rem;
}

/* custom design-system component - p-toolbox-table */
:deep(.p-toolbox-table) {
    .date-text {
        @apply text-paragraph-md;
        margin-top: 0.5rem;
    }
    .date-range-text {
        @apply text-gray-500 text-paragraph-sm;
        margin-bottom: 0.5rem;
    }
    .text {
        padding: 0 0.12rem;
    }
    .currency-symbol, .currency-text {
        @apply text-gray-700 text-paragraph-sm;
    }
    .float-right {
        @apply flex;
        gap: 0.5rem;
    }
    .copy-button, .resend-button {
        position: unset;
        height: 1.5rem;
    }
    .copy-button {
        min-width: 3.75rem;
    }
    .resend-button {
        min-width: 4.625rem;
    }
}
</style>
