<template>
    <div class="cost-analysis-query-filter">
        <div class="left-part">
            <div class="filter-item">
                <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                <p-select-dropdown :items="granularityItems"
                                   :selected="selectedGranularity"
                                   without-outline
                                   @select="handleSelectGranularity"
                />
            </div>
            <div class="filter-item">
                <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHART_TYPE') }}</b>
                <p-select-dropdown :items="chartTypeItems"
                                   :selected="selectedChartType"
                                   without-outline
                                   @select="handleSelectChartType"
                />
            </div>
        </div>
        <div class="right-part">
            <div class="filter-item">
                <p-datetime-picker :selected-dates="selectedDates"
                                   :timezone="timezone"
                                   style-type="text"
                                   mode="range"
                                   @update:selectedDates="handleSelectedDates"
                />
            </div>
            <p-select-dropdown class="filter-item"
                               :items="currencyItems"
                               :selected="selectedCurrency"
                               without-outline
                               @select="handleSelectCurrency"
            />
            <p-icon-button class="filter-item" name="ic_refresh" @click="handleClickRefresh" />
        </div>
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PIconButton, PSelectDropdown, PDatetimePicker,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { ChartType } from '@/services/billing/cost-management/cost-analysis/store/type';
import {
    CHART_TYPE, CURRENCY, GRANULARITY,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
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
            timezone: computed(() => store.state.user.timezone),
            selectedGranularity: computed(() => store.state.service.costAnalysis.granularity),
            selectedChartType: computed(() => store.state.service.costAnalysis.chartType),
            selectedCurrency: computed(() => store.state.service.costAnalysis.currency),
            selectedDates: computed(() => store.state.service.costAnalysis.selectedDates),
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
                { type: 'item', name: CURRENCY.USD, label: '$USD' },
                { type: 'item', name: CURRENCY.KRW, label: '$KRW' },
                { type: 'item', name: CURRENCY.JPY, label: '¥JPY' },
            ])),
        });

        /* event */
        const handleSelectGranularity = async (granularity: string) => {
            let chartType: ChartType;
            if (granularity === GRANULARITY.ACCUMULATED) {
                chartType = CHART_TYPE.DONUT;
            } else {
                chartType = CHART_TYPE.STACKED_COLUMN;
            }
            store.commit('service/costAnalysis/setChartType', chartType);
            store.commit('service/costAnalysis/setGranularity', granularity);
            await store.dispatch('service/costAnalysis/getChartData');
        };
        const handleSelectChartType = async (chartType: ChartType) => {
            store.commit('service/costAnalysis/setChartType', chartType);
            await store.dispatch('service/costAnalysis/getChartData');
        };
        const handleSelectedDates = async (selectedDates: Array<string>) => {
            store.commit('service/costAnalysis/setSelectedDates', selectedDates);
            await store.dispatch('service/costAnalysis/getChartData');
        };
        const handleSelectCurrency = async (currency: string) => {
            store.commit('service/costAnalysis/setCurrency', currency);
        };
        const handleClickRefresh = async () => {
            await store.dispatch('service/costAnalysis/getChartData');
        };

        const initSelectedDates = () => {
            const offsetHours = dayjs().tz(state.timezone).utcOffset() / 60;
            const startDate = dayjs.utc().startOf('month').utcOffset(offsetHours, true).format();
            const endDate = dayjs.utc().utcOffset(offsetHours, true).format();
            store.commit('service/costAnalysis/setSelectedDates', [startDate, endDate]);
        };
        (async () => {
            initSelectedDates();
            await store.dispatch('service/costAnalysis/getChartData');
        })();

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
