<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';
import { capitalize } from 'lodash';

import { makeDistinctValueHandler, makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PHeading, PI, PToolboxTable, PSelectDropdown, PBadge, PTextButton, PHeadingLayout, PStatus,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { copyAnyData } from '@/lib/helper/copy-helper';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import CustomDateModal from '@/common/components/custom-date-modal/CustomDateModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import { green, gray } from '@/styles/colors';

import CostReportResendModal from '@/services/cost-explorer/components/CostReportResendModal.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


const allReferenceStore = useAllReferenceStore();
const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;
const appContextStore = useAppContextStore();

const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
const workspaces = computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace);

const state = reactive({
    currency: computed(() => costReportPageState.costReportConfig?.currency || 'KRW' as Currency),
    periodMenuItems: computed<MenuItem[]>(() => {
        const locale = i18n.locale;
        const thisMonth = dayjs.utc();
        const last12Months = Array.from({ length: 12 }, (_, i) => thisMonth.subtract(i, 'month'));
        return [
            { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALL') },
            ...last12Months.map((month) => ({ name: month.locale(locale).format('YYYY-MM'), label: month.locale(locale).format('MMMM YYYY') })),
            { type: 'divider' },
            { name: 'custom', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.CUSTOM') },
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
        ...(isAdminMode.value ? [{ label: 'Workspace', name: 'workspace_id' }] : []),
        { label: 'Cost', name: 'cost', textAlign: 'right' },
        { label: 'Status', name: 'status' },
        { label: ' ', name: 'extra' },
    ],
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'issue_date', label: 'Issue Date' },
                { name: 'report_number', label: 'Report Number' },
                { name: 'workspace_id', label: 'Workspace' },
            ],
        }] as KeyItemSet[],
    valueHandlerMap: {
        issue_date: makeDistinctValueHandler('cost_analysis.CostReport', 'issue_date', 'string', [{ k: 'status', v: 'SUCCESS', o: 'eq' }]),
        report_number: makeDistinctValueHandler('cost_analysis.CostReport', 'report_number', 'string', [{ k: 'status', v: 'SUCCESS', o: 'eq' }]),
        workspace_id: makeReferenceValueHandler('identity.Workspace'),
    },
});



const costReportListApiQueryHelper = new ApiQueryHelper()
    .setSort('issue_date', true);
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
const getStatusIcon = (status: string): string => {
    if (status === 'DONE') return 'ic_check';
    if (status === 'EXPIRED') return 'ic_limit-filled';
    return 'ic_peacock-gradient-circle';
};
const getStatusIconColor = (status: string): string | undefined => {
    if (status === 'DONE') return green[500];
    if (status === 'EXPIRED') return gray[400];
    return undefined;
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
        const reportUrl = await costReportPageStore.getCostReportUrl({
            cost_report_id: id,
        });
        costReportPageState.reportItem = {
            ...costReportPageState.reportItem,
            report_url: reportUrl || undefined,
        };
        state.resendModalVisible = true;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleChange = (options: any = {}) => {
    getCostReportsList(options);
};
const handleClickLinkButton = async (id: string) => {
    try {
        const response = await costReportPageStore.getCostReportUrl({
            cost_report_id: id,
        });
        window.open(response, '_blank');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};

/* API */
const getCostReportsList = (options: any = {}) => {
    setApiQueryWithToolboxOptions(costReportListApiQueryHelper, options);
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
        tableState.searchFilters = costReportListApiQueryHelper.filters;
    }
    if (options.pageStart !== undefined) tableState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) tableState.pageLimit = options.pageLimit;
    costReportListApiQueryHelper.setPageStart(tableState.pageStart).setPageLimit(tableState.pageLimit);
    if (!isAdminMode.value) {
        costReportListApiQueryHelper.setFilters([
            { k: 'status', v: ['DONE'], o: '' },
        ]);
    }
    costReportPageStore.fetchCostReportsList({
        query: costReportListApiQueryHelper.data,
    });
};

/* Watcher */
watch([() => state.selectedPeriod, () => state.customPeriod], ([selectedPeriod, customPeriod]) => {
    const filters = [...tableState.searchFilters];

    if (selectedPeriod !== 'all') {
        if (selectedPeriod === 'custom') {
            filters.push({ k: 'issue_date', v: dayjs.utc(customPeriod?.start).format('YYYY-MM') || '', o: '>=' });
            filters.push({ k: 'issue_date', v: dayjs.utc(customPeriod?.end).add(1, 'month').format('YYYY-MM') || '', o: '<' });
        } else {
            filters.push({ k: 'report_month', v: dayjs.utc(selectedPeriod).subtract(1, 'month').format('YYYY-MM'), o: '=' });
        }
    }

    costReportListApiQueryHelper.setFilters(filters);
    getCostReportsList({
        pageStart: 0,
    });
});
watch(() => costReportPageState.activeTab, (activeTab) => {
    if (activeTab === 'reports') {
        queryTagHelper.setQueryTags([]);
        tableState.searchFilters = [];
        state.selectedPeriod = 'all';
        state.customPeriod = undefined;
        getCostReportsList();
    }
}, { immediate: true });
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
                         @change="handleChange"
                         @refresh="handleChange()"
        >
            <template #toolbox-top>
                <p-heading-layout class="pt-8 px-4 pb-4">
                    <template #heading>
                        <p-heading heading-type="sub"
                                   use-total-count
                                   :total-count="costReportPageState.reportListTotalCount"
                                   :title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORTS')"
                        />
                    </template>
                    <template #extra>
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
                            :selection-label="$t('BILLING.COST_MANAGEMENT.COST_REPORT.PERIOD')"
                            style-type="rounded"
                            class="period-select-dropdown"
                            @select="handleSelectPeriodMenuItem"
                        />
                    </template>
                </p-heading-layout>
            </template>
            <template #col-workspace_id-format="{value, item}">
                <div :class="{ 'expired-row': item.status === 'EXPIRED' }">
                    {{ workspaces[value]?.name || value }}
                </div>
            </template>
            <template #col-issue_date-format="{value, item}">
                <div :class="{ 'expired-row': item.status === 'EXPIRED' }">
                    <div class="date-text">
                        {{ value }}
                    </div>
                    <div class="date-range-text">
                        {{ getDateRangeText(value) }}
                    </div>
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
                <div :class="{ 'expired-row': item.status === 'EXPIRED' }">
                    <span class="currency-symbol">{{ CURRENCY_SYMBOL[item.currency] }}</span>
                    <span class="text">{{ currencyMoneyFormatter(value[item.currency], { currency: state.currency, style: 'decimal' }) || 0 }}</span>
                    <span class="currency-text">{{ item.currency }}</span>
                </div>
            </template>
            <template #col-status-format="{value}">
                <p-status :icon="getStatusIcon(value)"
                          :icon-color="getStatusIconColor(value)"
                          :text="capitalize(value)"
                />
            </template>
            <template #col-extra-format="{item}">
                <div v-if="item.status === 'DONE'"
                     class="float-right"
                >
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
                           disable-future
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
    .report-link {
        @apply flex items-center text-blue-700;
        gap: 0.25rem;
    }
    .expired-row {
        opacity: 0.4;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    &.period-select-dropdown {
        .selection-wrapper {
            height: 1.125rem;
            line-height: 1.125rem;
        }
        .selected-item-text {
            @apply block;
            height: 1.125rem;
        }
    }
}
</style>
