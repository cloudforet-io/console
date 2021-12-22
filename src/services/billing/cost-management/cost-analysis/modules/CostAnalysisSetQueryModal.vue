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
                <div v-if="granularity !== GRANULARITY.ACCUMULATED" class="input-wrapper">
                    <p class="input-title">
                        <span>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACK') }}</span>
                        <p-toggle-button class="ml-2"
                                         sync
                                         :value="stack"
                                         @change="handleToggleStack"
                        />
                    </p>
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
    PToggleButton,
} from '@spaceone/design-system';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { store } from '@/store';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { i18n } from '@/translations';
import { Period } from '@/services/billing/cost-management/type';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';


export default {
    name: 'CostAnalysisSetQueryModal',
    components: {
        PButtonModal,
        PSelectDropdown,
        PDatetimePicker,
        PToggleButton,
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
            stack: false,
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
            currencyItems: computed<MenuItem[]>(() => Object.values(CURRENCY).map(currency => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
            }))),
        });

        const handleFormConfirm = () => {
            store.commit('service/costAnalysis/setGranularity', state.granularity);
            store.commit('service/costAnalysis/setStack', state.stack);
            store.commit('service/costAnalysis/setPeriod', state.period);
            store.commit('display/setCurrency', state.currency);
            state.proxyVisible = false;
        };
        const handleSelectGranularity = (granularity: string) => {
            state.granularity = granularity;
        };
        const handleSelectedDates = async (selectedDates: string[]) => {
            state.period = { start: selectedDates[0], end: selectedDates[1] };
        };
        const handleSelectCurrency = (currency: CURRENCY) => {
            state.currency = currency;
        };
        const handleToggleStack = ({ value }) => {
            state.stack = value;
        };

        watch(() => state.proxyVisible, (after) => {
            if (after) {
                console.log('opened!');
                state.granularity = store.state.service.costAnalysis.granularity;
                state.stack = store.state.service.costAnalysis.stack;
                state.period = store.state.service.costAnalysis.period;
                state.currency = store.state.display.currency;
            }
        });

        return {
            ...toRefs(state),
            GRANULARITY,
            handleFormConfirm,
            handleSelectGranularity,
            handleSelectedDates,
            handleSelectCurrency,
            handleToggleStack,
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
