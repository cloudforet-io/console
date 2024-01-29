<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PSelectButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectButtonType } from '@spaceone/design-system/types/inputs/buttons/select-button-group/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';

import { numberFormatter } from '@cloudforet/utils';

import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import CostReportOverviewCostTrendContent from '@/services/cost-explorer/components/CostReportOverviewCostTrendContent.vue';
import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const state = reactive({
    dateSelectDropdown: computed<SelectDropdownMenuItem[]>(() => {
        const _defaultStart = costReportPageGetters.recentReportDate.subtract(11, 'month').format('YYYY-MM');
        const _defaultEnd = costReportPageGetters.recentReportDate.format('YYYY-MM');
        const _default: SelectDropdownMenuItem = {
            name: 'last12Months', label: `Last 12 Months (${_defaultStart} ~ ${_defaultEnd})`,
        };
        const last3Years = Array.from({ length: 3 }).map((_, idx) => {
            const _year = costReportPageGetters.recentReportDate.subtract(idx - 1, 'year').format('YYYY');
            return {
                name: _year, label: `${_year} (${_year}-01 ~ 12)`,
            };
        });
        return [_default, ...last3Years];
    }),
    selectedDate: 'last12Months',
    targetSelectItems: [
        GROUP_BY_ITEM_MAP.workspace_id,
        GROUP_BY_ITEM_MAP.provider,
    ] as SelectButtonType[],
    selectedTarget: 'workspace_id',
    previousTotalAmount: 957957,
    last12MonthsAverage: 726568,
    period: computed(() => {
        if (state.selectedDate === 'last12Months') {
            const start = costReportPageGetters.recentReportDate.subtract(11, 'month').format('YYYY-MM');
            const end = costReportPageGetters.recentReportDate.format('YYYY-MM');
            return { start, end };
        }
        const start = `${state.selectedDate}-01`;
        const end = `${state.selectedDate}-12`;
        return { start, end };
    }),
    //
    selectedPeriodTranslation: computed(() => {
        if (state.selectedDate === 'last12Months') {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.THE_LAST_12_MONTHS');
        }
        return dayjs.utc(state.selectedDate).year();
    }),
});

/* Event */
const handleSelectDate = (date: string) => {
    state.selectedDate = date;
};
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
};
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="mr-3">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COST_TREND') }}
            </span>
            <p-select-dropdown style-type="transparent"
                               :menu="state.dateSelectDropdown"
                               :selected="state.selectedDate"
                               @select="handleSelectDate"
            />
        </template>
        <template #right-extra>
            <div class="select-button-wrapper">
                <p-select-button v-for="item in state.targetSelectItems"
                                 :key="`cost-trend-select-button-${item.name}`"
                                 :value="item.name"
                                 :selected="state.selectedTarget"
                                 size="sm"
                                 style-type="secondary"
                                 @change="handleChangeTarget"
                >
                    {{ item.label }}
                </p-select-button>
            </div>
        </template>
        <template #content>
            <div class="summary-wrapper">
                <div class="summary-item">
                    <div class="summary-label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.TOTAL_COST_FOR_PREVIOUS_MONTH', { previous_month: state.period.end }) }}
                    </div>
                    <div class="summary-value">
                        <span class="currency-symbol">{{ CURRENCY_SYMBOL[costReportPageGetters.currency] }}</span>
                        <span class="value">{{ numberFormatter(state.previousTotalAmount) }}</span>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.THE_AVERAGE_FOR_SELECTED_PERIOD', { selected_period: state.selectedPeriodTranslation }) }}
                    </div>
                    <div class="summary-value">
                        <span class="currency-symbol">{{ CURRENCY_SYMBOL[costReportPageGetters.currency] }}</span>
                        <span class="value">{{ numberFormatter(state.last12MonthsAverage) }}</span>
                    </div>
                </div>
            </div>
            <cost-report-overview-cost-trend-content
                :group-by="state.selectedTarget"
                :period="state.period"
            />
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="postcss" scoped>
.select-button-wrapper {
    display: flex;
    gap: 0.25rem;
}
.summary-wrapper {
    display: flex;
    gap: 1.5rem;
    .summary-label {
        @apply text-label-md text-gray-600;
        padding-bottom: 0.25rem;
    }
    .currency-symbol {
        @apply text-label-xl text-gray-600;
    }
    .value {
        @apply text-display-md;
        font-weight: 700;
        padding-left: 0.125rem;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .p-context-menu-item {
        font-weight: normal;
    }
}
</style>
