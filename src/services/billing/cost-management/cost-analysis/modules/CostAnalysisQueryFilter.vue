<template>
    <div class="cost-analysis-query-filter">
        <div class="left-part">
            <div class="filter-item">
                <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                <p-select-dropdown :items="granularityItems"
                                   :selected="granularity"
                                   without-outline
                                   @select="handleSelectGranularity"
                />
            </div>
            <div class="filter-item">
                <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHART_TYPE') }}</b>
                <p-select-dropdown :items="chartTypeItems"
                                   :selected="chartType"
                                   without-outline
                                   @select="handleSelectChartType"
                />
            </div>
        </div>
        <div class="right-part">
            <span class="timezone-text">UTC</span>
            <div class="filter-item">
                <p-datetime-picker :selected-dates="[period.start, period.end]"
                                   style-type="text"
                                   select-mode="range"
                                   @update:selectedDates="handleSelectedDates"
                />
            </div>
            <p-select-dropdown class="filter-item"
                               :items="currencyItems"
                               :selected="currency"
                               without-outline
                               @select="handleSelectCurrency"
            />
            <p-icon-button class="filter-item" name="ic_refresh" @click="handleClickRefresh" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PIconButton, PSelectDropdown, PDatetimePicker,
} from '@spaceone/design-system';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { store } from '@/store';
import { i18n } from '@/translations';


export default {
    name: 'CostAnalysisQueryFilter',
    components: {
        PSelectDropdown,
        PDatetimePicker,
        PIconButton,
    },
    setup() {
        const state = reactive({
            granularity: computed(() => store.state.service.costAnalysis.granularity),
            chartType: computed(() => store.state.service.costAnalysis.chartType),
            period: computed(() => store.state.service.costAnalysis.period),
            currency: 'USD',
            //
            granularityItems: computed<MenuItem[]>(() => ([
                {
                    type: 'item',
                    name: GRANULARITY.ACCUMULATED,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ACCUMULATED'),
                },
                {
                    type: 'item',
                    name: GRANULARITY.DAILY,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY'),
                },
                {
                    type: 'item',
                    name: GRANULARITY.MONTHLY,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY'),
                },
                {
                    type: 'item',
                    name: GRANULARITY.YEARLY,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.YEARLY'),
                },
            ])),
            chartTypeItems: computed<MenuItem[]>(() => ([
                // {
                //     type: 'item',
                //     name: CHART_TYPE.LINE,
                //     label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LINE'),
                // },
                // {
                //     type: 'item',
                //     name: CHART_TYPE.STACKED_LINE,
                //     label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACKED_LINE'),
                // },
                // {
                //     type: 'item',
                //     name: CHART_TYPE.COLUMN,
                //     label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COLUMN'),
                // },
                {
                    type: 'item',
                    name: CHART_TYPE.STACKED_COLUMN,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACKED_COLUMN'),
                },
                {
                    type: 'item',
                    name: CHART_TYPE.DONUT,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DONUT'),
                },
            ])),
            currencyItems: computed<MenuItem[]>(() => ([
                { type: 'item', name: 'USD', label: '$USD' },
                { type: 'item', name: 'KRW', label: '$KRW' },
                { type: 'item', name: 'JPY', label: '¥JPY' },
            ])),
        });

        /* event */
        const handleSelectGranularity = async (granularity: string) => {
            let chartType: CHART_TYPE;
            if (granularity === GRANULARITY.ACCUMULATED) {
                chartType = CHART_TYPE.DONUT;
            } else {
                chartType = CHART_TYPE.STACKED_COLUMN;
            }
            store.commit('service/costAnalysis/setChartType', chartType);
            store.commit('service/costAnalysis/setGranularity', granularity);
        };
        const handleSelectChartType = async (chartType: CHART_TYPE) => {
            store.commit('service/costAnalysis/setChartType', chartType);
        };
        const handleSelectedDates = async (selectedDates: string[]) => {
            store.commit('service/costAnalysis/setPeriod', { start: selectedDates[0], end: selectedDates[1] });
        };
        const handleSelectCurrency = async (currency: string) => {
            state.currency = currency;
        };
        const handleClickRefresh = async () => {
            // todo
        };

        return {
            ...toRefs(state),
            handleSelectGranularity,
            handleSelectChartType,
            handleSelectedDates,
            handleSelectCurrency,
            handleClickRefresh,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-query-filter {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    padding-bottom: 1rem;

    .left-part {
        display: flex;
        align-items: center;
        .filter-item {
            .p-select-dropdown {
                padding-left: 0.5rem;
            }
        }
    }
    .right-part {
        display: flex;
        align-items: center;
        .timezone-text {
            @apply text-gray-400;
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.5;
            padding-right: 0.5rem;
        }
    }
    .filter-item {
        display: flex;
        align-items: center;
        margin-right: 0.5rem;
        &::after {
            @apply bg-gray-300;
            display: inline-block;
            position: relative;
            content: '';
            width: 1px;
            height: 1rem;
        }
        &:last-child {
            &::after {
                display: none;
            }
        }
    }
    .p-select-dropdown {
        @apply bg-transparent;
    }
}
</style>
