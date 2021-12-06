<template>
    <p-button-modal
        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SET_QUERY')"
        :visible.sync="proxyVisible"
        size="sm"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <div class="set-query-modal-body">
                <div class="input-wrapper">
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}
                    </p>
                    <p-select-dropdown
                        class="select-input-box"
                        use-fixed-menu-style
                        :items="granularityItems"
                        :selected="granularity"
                        @select="handleSelectGranularity"
                    />
                </div>
                <div class="input-wrapper">
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHART_TYPE') }}
                    </p>
                    <p-select-dropdown
                        class="select-input-box"
                        use-fixed-menu-style
                        :items="chartTypeItems"
                        :selected="chartType"
                        @select="handleSelectChartType"
                    />
                </div>
                <div class="input-wrapper">
                    <p class="input-title">
                        {{ `${$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.START_DATE')} ~ ${$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.END_DATE')} (UTC)` }}
                    </p>
                    <div class="filter-item">
                        <p-datetime-picker
                            class="select-input-box"
                            :selected-dates="[period.start, period.end]"
                            select-mode="range"
                            @update:selectedDates="handleSelectedDates"
                        />
                    </div>
                </div>
                <div class="input-wrapper">
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CURRENCY') }}
                    </p>
                    <p class="input-description">
                        Global setting
                    </p>
                    <p-select-dropdown
                        class="select-input-box"
                        :items="currencyItems"
                        :selected="currency"
                        use-fixed-menu-style
                        @select="handleSelectCurrency"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal,
    PSelectDropdown,
    PDatetimePicker,
} from '@spaceone/design-system';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { store } from '@/store';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { i18n } from '@/translations';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import { Period } from '@/services/billing/cost-management/type';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';


export default {
    name: 'CostAnalysisSetQueryModal',
    components: {
        PButtonModal,
        PSelectDropdown,
        PDatetimePicker,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            granularity: '' as GRANULARITY,
            chartType: '' as CHART_TYPE,
            period: {} as Period,
            currency: '' as CURRENCY,
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
            currencyItems: computed<MenuItem[]>(() => Object.values(CURRENCY).map(currency => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
            }))),
        });

        const handleFormConfirm = () => {
            store.commit('service/costAnalysis/setChartType', state.chartType);
            store.commit('service/costAnalysis/setGranularity', state.granularity);
            store.commit('service/costAnalysis/setPeriod', state.period);
            store.commit('display/setCurrency', state.currency);
            state.proxyVisible = false;
        };
        const handleSelectGranularity = (granularity: string) => {
            let chartType: CHART_TYPE;
            if (granularity === GRANULARITY.ACCUMULATED) {
                chartType = CHART_TYPE.DONUT;
            } else {
                chartType = CHART_TYPE.STACKED_COLUMN;
            }
            state.chartType = chartType;
            state.granularity = granularity;
        };
        const handleSelectChartType = async (chartType: CHART_TYPE) => {
            state.chartType = chartType;
        };
        const handleSelectedDates = async (selectedDates: string[]) => {
            state.period = { start: selectedDates[0], end: selectedDates[1] };
        };
        const handleSelectCurrency = (currency: CURRENCY) => {
            state.currency = currency;
        };

        watch(() => state.proxyVisible, (after) => {
            if (after) {
                state.granularity = store.state.service.costAnalysis.granularity;
                state.chartType = store.state.service.costAnalysis.chartType;
                state.period = store.state.service.costAnalysis.period;
                state.currency = store.state.display.currency;
            }
        });

        return {
            ...toRefs(state),
            handleFormConfirm,
            handleSelectGranularity,
            handleSelectChartType,
            handleSelectedDates,
            handleSelectCurrency,
        };
    },
};

</script>


<style scoped lang="postcss">
.set-query-modal-body {
    margin-bottom: 2rem;
    .input-wrapper {
        .input-title {
            @apply font-bold;
            margin-top: 1rem;
            margin-bottom: 0.375rem;
            font-size: 0.875rem;
            line-height: 140%;
        }
        .select-input-box {
            width: 100%;
        }
        .input-description {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }
    }
}
</style>
