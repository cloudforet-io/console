<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PButton, PHeading, PI, PToolboxTable, PSelectDropdown, PBadge, PTextButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import dayjs from 'dayjs';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { numberFormatter } from '@cloudforet/utils';

import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { copyAnyData } from '@/lib/helper/copy-helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import CustomDateModal from '@/common/components/custom-date-modal/CustomDateModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import CostReportResendModal from '@/services/cost-explorer/components/CostReportResendModal.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';

const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;

const state = reactive({
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
const tableState = reactive({
    pageStart: 0,
    pageLimit: 15,
    searchFilters: [] as ConsoleFilter[],
    field: [
        { label: 'Issue Date', name: 'issue_date' },
        { label: 'Report Number', name: 'report_number' },
        { label: 'Workspace', name: 'workspace_name' },
        { label: 'Cost', name: 'cost', textAlign: 'right' },
        { label: ' ', name: 'extra' },
    ],
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'issue_date', label: 'Issue Date' },
                { name: 'report_number', label: 'Report Number' },
                { name: 'workspace_name', label: 'Workspace' },
            ],
        }] as KeyItemSet[],
    valueHandlerMap: {
        issue_date: makeDistinctValueHandler('costAnalysis.costReport', 'issue_date'),
        report_number: makeDistinctValueHandler('costAnalysis.costReport', 'report_number'),
        workspace_name: makeDistinctValueHandler('costAnalysis.costReport', 'workspace_name'),
    },
});


const costReportListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(tableState.pageStart).setPageLimit(tableState.pageLimit)
    .setSort('issue_date', true);
let costReportListApiQuery = costReportListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

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
const handleClickCopyButton = async (id: string) => {
    try {
        const response = await costReportPageStore.getCostReportUrl({
            cost_report_id: id,
        });
        copyAnyData(response);
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_COPY_REPORT_URL'), '');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const handleClickResendButton = async (id: string): Promise<void> => {
    if ((costReportPageState.costReportConfig?.recipients?.role_types.length || 0) === 0) {
        showErrorMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_E_RESEND_REPORT'), '');
        return;
    }
    try {
        await costReportPageStore.fetchCostReport({
            cost_report_id: id,
        });
        state.resendModalVisible = true;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleChange = (options: any = {}) => {
    costReportListApiQuery = getApiQueryWithToolboxOptions(costReportListApiQueryHelper, options) ?? costReportListApiQuery;
    if (options.queryTags !== undefined) {
        tableState.searchFilters = costReportListApiQueryHelper.filters;
    }
    if (options.pageStart !== undefined) tableState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) tableState.pageLimit = options.pageLimit;
    costReportPageStore.fetchCostReportsList({
        query: costReportListApiQuery,
    });
};
const handleClickLinkButton = async (id: string) => {
    try {
        const response = await costReportPageStore.getCostReportUrl({
            cost_report_id: id,
        });
        // TODO: check
        window.open(`${window.location.origin}/${response.split('/')[3]}`, '_blank');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};

/* Watcher */
watch([() => state.selectedPeriod, () => state.customPeriod], ([selectedPeriod, customPeriod]) => {
    if (selectedPeriod === 'all') {
        costReportListApiQueryHelper.setFilters([]);
    } else if (selectedPeriod === 'custom') {
        const { start, end } = customPeriod || {};
        costReportListApiQueryHelper.setFilters([
            { k: 'report_month', v: start || '', o: '>=' },
            { k: 'report_month', v: end || '', o: '<=' },
        ]);
    } else {
        costReportListApiQueryHelper.setFilters([
            { k: 'report_month', v: selectedPeriod, o: '=' },
        ]);
    }
    tableState.pageStart = 0;
    costReportPageStore.fetchCostReportsList({
        query: costReportListApiQueryHelper.data,
    });
});

/* Init */
onMounted(() => {
    handleChange();
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
                         :fields="tableState.field"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         :this-page="tableState.pageStart + 1"
                         @change="handleChange"
                         @refresh="handleChange()"
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
            <template #col-report_number-format="{value, item}">
                <p-text-button style-type="highlight"
                               class="report-link"
                               size="md"
                               @click="handleClickLinkButton(item.cost_report_id)"
                >
                    {{ value }}
                    <p-i name="ic_arrow-right-up"
                         class="link-mark"
                         height="0.875rem"
                         width="0.875rem"
                         color="inherit"
                    />
                </p-text-button>
            </template>
            <template #col-cost-format="{value, item}">
                <span class="currency-symbol">{{ CURRENCY_SYMBOL[item.currency] }}</span>
                <span class="text">{{ numberFormatter(value[item.currency]) || 0 }}</span>
                <span class="currency-text">{{ item.currency }}</span>
            </template>
            <template #col-extra-format="{item}">
                <div class="float-right">
                    <p-button style-type="tertiary"
                              icon-left="ic_link"
                              size="sm"
                              class="copy-button"
                              @click="handleClickCopyButton(item.cost_report_id)"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COPY') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              icon-left="ic_paper-airplane"
                              size="sm"
                              class="resend-button"
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
    .heading-sub {
        margin-bottom: 0;
    }
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
    .report-link {
        @apply flex items-center text-blue-700;
        gap: 0.25rem;
    }
}
</style>
