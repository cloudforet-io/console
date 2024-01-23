<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PButton, PHeading, PLink, PToolboxTable, PSelectDropdown, PBadge,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';

import { numberFormatter } from '@cloudforet/utils';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import CustomDateModal from '@/common/components/custom-date-modal/CustomDateModal.vue';

import CostReportResendModal from '@/services/cost-explorer/components/CostReportResendModal.vue';
import type { Field } from '@/services/dashboards/widgets/_types/widget-data-table-type';


const state = reactive({
    loading: false,
    totalCount: 0,
    fields: [
        { label: 'Issue Date', name: 'date' },
        { label: 'Report Number', name: 'number' },
        { label: 'Workspace', name: 'workspace' },
        { label: 'Cost', name: 'cost' },
        { label: ' ', name: 'extra' },
    ] as Field[],
    items: [
        {
            date: '2024-01-10',
            number: 'INV_2307100001',
            workspace: 'SpaceOne',
            cost: 1000000,
        },
        {
            date: '2023-12-10',
            number: 'INV_2302342342',
            workspace: 'Megazone Cloud',
            cost: 9500000,
        },
    ],
    tags: [],
    currency: 'KRW' as Currency,
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

/* Util */
const getDateRangeText = (date: string): string => {
    const _date = dayjs.utc(date);
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
const handleClickResendButton = (): void => {
    state.resendModalVisible = true;
};
</script>

<template>
    <div>
        <p-toolbox-table class="cost-report-reports-tab"
                         search-type="query"
                         :multi-select="false"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :items="state.items"
                         :fields="state.fields"
                         :query-tags="state.tags"
        >
            <template #toolbox-top>
                <p-heading heading-type="sub"
                           use-total-count
                           :total-count="state.totalCount"
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
            <template #col-date-format="{value}">
                <div class="date-text">
                    {{ value }}
                </div>
                <div class="date-range-text">
                    {{ getDateRangeText(value) }}
                </div>
            </template>
            <template #col-number-format="{value}">
                <p-link :text="value"
                        href="/"
                        highlight
                        action-icon="external-link"
                />
            </template>
            <template #col-cost-format="{value}">
                <span class="currency-symbol">{{ CURRENCY_SYMBOL[state.currency] }}</span>
                <span class="text">{{ numberFormatter(value) }}</span>
                <span class="currency-text">{{ state.currency }}</span>
            </template>
            <template #col-extra-format>
                <div class="float-right">
                    <p-button style-type="tertiary"
                              icon-left="ic_link"
                              size="sm"
                              class="mr-2"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COPY') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              icon-left="ic_paper-airplane"
                              size="sm"
                              @click="handleClickResendButton"
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
    }
    .date-range-text {
        @apply text-gray-500 text-paragraph-sm;
    }
    .text {
        padding: 0 0.12rem;
    }
    .currency-symbol, .currency-text {
        @apply text-gray-700 text-paragraph-sm;
    }
}
</style>
